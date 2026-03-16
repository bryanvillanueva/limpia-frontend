import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Alert, Autocomplete, TextField, ToggleButton, ToggleButtonGroup,
  Typography, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from '@mui/material';
import { Add, Circle, RemoveCircleOutline } from '@mui/icons-material';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PlannerGrid from './PlannerGrid';
import AddItemModal from './AddItemModal';
import { useAuth } from '../../context/AuthContext';
import { getTeams } from '../../services/teams.service';
import {
  getMyTeam, getWeekPlan, getTeamSites, createItem, updatePlan, updateItem, deleteItem,
} from '../../services/planner.service';

const CYCLE_WEEKS = [1, 2, 3, 4];

const COLOR_OPTIONS = [
  { value: 'yellow', hex: '#F9A825' },
  { value: 'red',    hex: '#E53935' },
  { value: 'green',  hex: '#43A047' },
  { value: 'blue',   hex: '#1E88E5' },
];

/**
 * Main Planner page — orchestrates team selection, cycle-week tabs,
 * the weekly grid, and CRUD modals for planner items.
 * Accessible to all authenticated roles.
 * Cleaners see only their team (auto-selected); admin/manager/accountant pick any team.
 */
export default function PlannerPage() {
  const { user } = useAuth();
  const canSelectTeam = ['admin', 'manager', 'accountant'].includes(user?.rol);

  /* ── Team selector state ── */
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamsLoading, setTeamsLoading] = useState(true);

  /* ── Week & grid state ── */
  const [cycleWeek, setCycleWeek] = useState(1);
  const [plans, setPlans] = useState([]);
  const [dayTotals, setDayTotals] = useState({});
  const [gridLoading, setGridLoading] = useState(false);

  /* ── Available sites for add-item dropdown ── */
  const [availableSites, setAvailableSites] = useState([]);

  /* ── UI state ── */
  const [error, setError] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [addModalPrefill, setAddModalPrefill] = useState({ day: null, siteId: null });
  const [saving, setSaving] = useState(false);

  /* ── Delete confirm ── */
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ── Edit dialog ── */
  const [commentPlan, setCommentPlan] = useState(null);
  const [editDayItems, setEditDayItems] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentColor, setCommentColor] = useState(null);
  const [itemEdits, setItemEdits] = useState({});
  const [commentSaving, setCommentSaving] = useState(false);

  /**
   * On mount, resolves the available teams based on role.
   * - admin/manager/accountant: fetches full teams list via GET /teams for the dropdown.
   * - cleaner: discovers their own team from GET /sites/my-sites (assignment data includes team_id).
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (canSelectTeam) {
          const list = await getTeams();
          if (cancelled) return;
          setTeams(list);
          if (list.length > 0) setSelectedTeam(list[0]);
        } else {
          const myTeam = await getMyTeam();
          if (cancelled) return;
          setSelectedTeam({ id: myTeam.team_id, numero: myTeam.team_numero ?? String(myTeam.team_id) });
        }
      } catch {
        setError(canSelectTeam ? 'Error al cargar equipos' : 'Error al detectar tu equipo');
      } finally {
        if (!cancelled) setTeamsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [canSelectTeam]);

  /**
   * Fetches the planner grid and available sites whenever the selected team or cycle week changes.
   * Both calls run in parallel for speed.
   */
  const loadGrid = useCallback(async () => {
    if (!selectedTeam) return;
    setGridLoading(true);
    setError('');
    try {
      const [gridData, sites] = await Promise.all([
        getWeekPlan(selectedTeam.id, cycleWeek),
        getTeamSites(selectedTeam.id),
      ]);
      setPlans(gridData.plans || []);
      setDayTotals(gridData.day_totals || {});
      setAvailableSites(sites || []);
    } catch {
      setError('Error al cargar el planner');
    } finally {
      setGridLoading(false);
    }
  }, [selectedTeam, cycleWeek]);

  useEffect(() => { loadGrid(); }, [loadGrid]);

  /* ── Handlers ── */

  const handleAddItem = ({ siteId, dayOfWeek }) => {
    setAddModalPrefill({ day: dayOfWeek, siteId });
    setAddModalKey(k => k + 1);
    setAddModalOpen(true);
  };

  const handleAddSubmit = async (formData) => {
    if (!selectedTeam) return;
    setSaving(true);
    try {
      const { color, ...itemData } = formData;
      const result = await createItem({
        team_id: selectedTeam.id,
        cycle_week: cycleWeek,
        ...itemData,
      });
      if (color && result?.plan_id) {
        await updatePlan(result.plan_id, { color });
      }
      setAddModalOpen(false);
      await loadGrid();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Error al crear item';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget.item_id);
      setDeleteTarget(null);
      await loadGrid();
    } catch {
      setError('Error al eliminar item');
    }
  };

  const handleEditPlan = (plan, dayItems = []) => {
    setCommentPlan(plan);
    setEditDayItems(dayItems);
    setCommentText(plan.week_comment || '');
    setCommentColor(plan.color || null);
    const edits = {};
    for (const item of dayItems) {
      edits[item.item_id] = {
        entry_type: item.entry_type,
        item_comment: item.item_comment || '',
        display_value: '',
      };
    }
    setItemEdits(edits);
  };

  const handleCommentSave = async () => {
    if (!commentPlan) return;
    setCommentSaving(true);
    try {
      await updatePlan(commentPlan.plan_id, {
        week_comment: commentText.trim() || null,
        color: commentColor,
      });

      for (const item of editDayItems) {
        const edits = itemEdits[item.item_id];
        if (!edits) continue;
        const changes = {};
        const isOtro = edits.entry_type === 'OTHER';
        const effectiveType = isOtro ? 'SERVICE' : edits.entry_type;
        if (effectiveType !== item.entry_type) changes.entry_type = effectiveType;
        if ((edits.item_comment || '') !== (item.item_comment || '')) {
          changes.item_comment = edits.item_comment.trim() || null;
        }
        if (isOtro && edits.display_value !== '' && edits.display_value !== undefined) {
          const num = Number(edits.display_value);
          if (!isNaN(num) && num >= 0) changes.display_value = num;
        }
        if (Object.keys(changes).length > 0) {
          await updateItem(item.item_id, changes);
        }
      }

      setCommentPlan(null);
      await loadGrid();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar';
      setError(msg);
    } finally {
      setCommentSaving(false);
    }
  };

  const handleColorChange = async (plan, color) => {
    try {
      await updatePlan(plan.plan_id, { color });
      await loadGrid();
    } catch {
      setError('Error al actualizar color');
    }
  };

  return (
    <>
      <PageHeader
        title="Planner"
        subtitle="Planificación semanal por equipo y ciclo de 4 semanas"
        action={
          selectedTeam && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => { setAddModalPrefill({ day: null, siteId: null }); setAddModalKey(k => k + 1); setAddModalOpen(true); }}
            >
              Agregar Item
            </Button>
          )
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Controls bar: team selector + week tabs */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        {/* Team dropdown — only for admin/manager/accountant */}
        {canSelectTeam && (
          <Autocomplete
            value={selectedTeam}
            onChange={(_, val) => setSelectedTeam(val)}
            options={teams}
            getOptionLabel={(t) => `Equipo ${t.numero ?? t.id}`}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            loading={teamsLoading}
            renderInput={(params) => (
              <TextField {...params} label="Equipo" size="small" />
            )}
            sx={{ minWidth: 200 }}
            disableClearable
          />
        )}

        {/* Cycle-week toggle */}
        <ToggleButtonGroup
          exclusive
          value={cycleWeek}
          onChange={(_, val) => { if (val != null) setCycleWeek(val); }}
          size="small"
        >
          {CYCLE_WEEKS.map(w => (
            <ToggleButton key={w} value={w} sx={{ px: 2, textTransform: 'none', fontWeight: 600 }}>
              Sem {w}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Cleaner sees their team label instead of dropdown */}
        {!canSelectTeam && selectedTeam && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            Equipo {selectedTeam.numero ?? selectedTeam.id}
          </Typography>
        )}
      </Box>

      {/* Grid */}
      {selectedTeam ? (
        <PlannerGrid
          plans={plans}
          dayTotals={dayTotals}
          loading={gridLoading}
          onDeleteItem={(item) => setDeleteTarget(item)}
          onAddItem={handleAddItem}
          onEditPlan={handleEditPlan}
          onColorChange={handleColorChange}
        />
      ) : (
        !teamsLoading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">Seleccioná un equipo para ver el planner</Typography>
          </Box>
        )
      )}

      {/* Add Item Modal */}
      <AddItemModal
        key={addModalKey}
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        availableSites={availableSites}
        prefillDay={addModalPrefill.day}
        prefillSiteId={addModalPrefill.siteId}
        saving={saving}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar item"
        message="¿Estás seguro de que querés eliminar este item del planner?"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Edit Plan/Items Dialog */}
      <Dialog open={!!commentPlan} onClose={() => setCommentPlan(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar — {commentPlan?.direccion_linea1 || 'Sitio'}</DialogTitle>
        <DialogContent>
          {/* Per-item entry_type, value preview, custom value, and comment */}
          {editDayItems.map((item) => {
            const edits = itemEdits[item.item_id] || {};
            const canBins = commentPlan?.hace_bins === 1;
            const siteInfo = availableSites.find(s => s.site_id === commentPlan?.site_id);
            const currentType = edits.entry_type || item.entry_type;
            const isOtro = currentType === 'OTHER';
            const previewValue = siteInfo && !isOtro
              ? currentType === 'SERVICE'
                ? siteInfo.horas_por_trabajador != null ? `${siteInfo.horas_por_trabajador}h por trabajador` : 'Sin horas asignadas'
                : currentType === 'BINS'
                  ? siteInfo.pago_bins != null ? `$${Number(siteInfo.pago_bins).toFixed(2)} pago bins` : 'Sin pago bins asignado'
                  : null
              : null;
            return (
              <Box key={item.item_id} sx={{ mb: 2, mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Tipo de entrada
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={currentType}
                  onChange={(_, val) => {
                    if (val) setItemEdits(prev => ({
                      ...prev,
                      [item.item_id]: {
                        ...prev[item.item_id],
                        entry_type: val,
                        ...(val !== 'OTHER' ? { display_value: '' } : {}),
                      },
                    }));
                  }}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="SERVICE" sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Service
                  </ToggleButton>
                  <ToggleButton value="BINS" disabled={!canBins} sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Bins {!canBins ? '(no aplica)' : ''}
                  </ToggleButton>
                  <ToggleButton value="OTHER" sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Otro
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Value preview from assignment (SERVICE/BINS only) */}
                {previewValue && (
                  <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, px: 2, py: 1.25, mt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Valor estimado</Typography>
                    <Typography variant="body2" fontWeight={600}>{previewValue}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Valor actual: {item.display_value}
                    </Typography>
                  </Box>
                )}

                {/* Custom value input — only when "Otro" is selected */}
                {isOtro && (
                  <TextField
                    fullWidth
                    type="number"
                    value={edits.display_value ?? ''}
                    onChange={(e) => setItemEdits(prev => ({
                      ...prev,
                      [item.item_id]: { ...prev[item.item_id], display_value: e.target.value },
                    }))}
                    label="Valor personalizado"
                    required
                    sx={{ mt: 1.5 }}
                    slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                  />
                )}

                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={edits.item_comment ?? ''}
                  onChange={(e) => setItemEdits(prev => ({
                    ...prev,
                    [item.item_id]: { ...prev[item.item_id], item_comment: e.target.value },
                  }))}
                  label="Comentario del día"
                  sx={{ mt: 1.5 }}
                  slotProps={{ htmlInput: { maxLength: 255 } }}
                />
              </Box>
            );
          })}

          {/* Plan-level week comment */}
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            label="Comentario semanal"
            sx={{ mt: 1 }}
            slotProps={{ htmlInput: { maxLength: 255 } }}
          />

          {/* Color picker */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Color del sitio
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {COLOR_OPTIONS.map(c => (
                <IconButton
                  key={c.value}
                  size="small"
                  onClick={() => setCommentColor(c.value)}
                  sx={{
                    p: 0.5,
                    border: commentColor === c.value ? '2px solid' : '2px solid transparent',
                    borderColor: commentColor === c.value ? c.hex : 'transparent',
                  }}
                >
                  <Circle sx={{ fontSize: 24, color: c.hex }} />
                </IconButton>
              ))}
              <IconButton
                size="small"
                onClick={() => setCommentColor(null)}
                sx={{
                  p: 0.5,
                  border: commentColor === null ? '2px solid' : '2px solid transparent',
                  borderColor: commentColor === null ? 'text.disabled' : 'transparent',
                }}
              >
                <RemoveCircleOutline sx={{ fontSize: 24, color: 'text.disabled' }} />
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentPlan(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCommentSave} disabled={commentSaving}>
            {commentSaving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
