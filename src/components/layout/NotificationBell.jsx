import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton, Badge, Popover, Box, Typography, Button, Divider, CircularProgress,
  Snackbar, Alert, alpha,
} from '@mui/material';
import {
  Notifications, NotificationsNone, Share, CheckCircleOutline, HighlightOff, DoneAll, Assignment, AddLocationAlt,
} from '@mui/icons-material';
import {
  getUnreadCount, getNotifications, markNotificationRead, markAllNotificationsRead,
} from '../../services/notifications.service';
import ShareReviewDialog from './ShareReviewDialog';

const POLL_MS = 60 * 1000;

/** Fired after logs change outside the logs page (e.g. accepting a shared week) so pages can reload. */
export const LOGS_CHANGED_EVENT = 'limpia:logs-changed';

const TYPE_ICON = {
  log_share_request: <Share fontSize="small" />,
  log_share_accepted: <CheckCircleOutline fontSize="small" />,
  log_share_rejected: <HighlightOff fontSize="small" />,
  report_submitted: <Assignment fontSize="small" />,
  site_created: <AddLocationAlt fontSize="small" />,
};

// Notifications that open a page when tapped
const NOTIFICATION_LINK = {
  report_submitted: (n) => `/reportes/${n.ref_id}`,
  site_created: (n) => `/sitios/${n.ref_id}`,
};

const SHARE_STATUS_LABEL = {
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada por quien la envió',
};

/** "hace 5 min", "hace 2 h", "ayer", or a short date. */
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'ayer';
  if (d < 7) return `hace ${d} días`;
  return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
}

/**
 * Bell with unread badge in the top bar. Opens an inbox where log-share requests
 * can be accepted or rejected right from the notification.
 */
export default function NotificationBell() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewId, setReviewId] = useState(null); // share request being reviewed (preview dialog)
  const [notice, setNotice] = useState(null); // { severity, message }
  const openRef = useRef(false);

  const open = Boolean(anchorEl);
  openRef.current = open;

  const refreshCount = useCallback(async () => {
    try {
      setUnread(await getUnreadCount());
    } catch {
      // The badge is a nicety — never interrupt the user if polling fails
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setItems(data.notifications);
      setUnread(data.unread_count);
    } catch {
      setNotice({ severity: 'error', message: 'No se pudieron cargar las notificaciones' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll the badge while the tab is visible, and refresh as soon as the user comes back to it
  useEffect(() => {
    refreshCount();
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      refreshCount();
      if (openRef.current) loadList();
    };
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [refreshCount, loadList]);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    loadList();
  };

  const handleItemClick = async (n) => {
    if (n.type === 'log_share_request' && n.share_status === 'pending') {
      setAnchorEl(null);
      setReviewId(n.ref_id);
    }
    const link = NOTIFICATION_LINK[n.type]?.(n);
    if (link) {
      setAnchorEl(null);
      navigate(link);
    }
    if (n.read_at) return;
    setItems(prev => prev.map(x => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
    setUnread(u => Math.max(0, u - 1));
    try { await markNotificationRead(n.id); } catch { refreshCount(); }
  };

  const handleMarkAll = async () => {
    setItems(prev => prev.map(x => ({ ...x, read_at: x.read_at || new Date().toISOString() })));
    setUnread(0);
    try { await markAllNotificationsRead(); } catch { refreshCount(); }
  };

  /** The review dialog answered "reject": reflect it in the list and tell the user. */
  const handleRejected = () => {
    setItems(prev => prev.map(x => (x.type === 'log_share_request' && x.ref_id === reviewId ? { ...x, share_status: 'rejected', read_at: x.read_at || new Date().toISOString() } : x)));
    setReviewId(null);
    setNotice({ severity: 'info', message: 'Solicitud rechazada' });
    refreshCount();
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        size="small"
        aria-label={unread > 0 ? `Notificaciones (${unread} sin leer)` : 'Notificaciones'}
        sx={{ color: 'text.secondary' }}
      >
        <Badge color="error" badgeContent={unread} max={9} invisible={unread === 0}>
          {unread > 0 ? <Notifications fontSize="small" /> : <NotificationsNone fontSize="small" />}
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 'min(400px, calc(100vw - 24px))',
              maxHeight: 'min(560px, calc(100vh - 80px))',
              display: 'flex',
              flexDirection: 'column',
              mt: 1,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25 }}>
          <Typography variant="subtitle1">Notificaciones</Typography>
          <Button
            size="small"
            startIcon={<DoneAll fontSize="small" />}
            onClick={handleMarkAll}
            disabled={unread === 0}
            sx={{ textTransform: 'none' }}
          >
            Marcar leídas
          </Button>
        </Box>
        <Divider />

        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {loading && items.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
          ) : items.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No tienes notificaciones
            </Typography>
          ) : (
            items.map((n, i) => {
              const isUnread = !n.read_at;
              const pendingRequest = n.type === 'log_share_request' && n.share_status === 'pending';
              return (
                <Box key={n.id}>
                  {i > 0 && <Divider />}
                  <Box
                    onClick={() => handleItemClick(n)}
                    sx={{
                      display: 'flex', gap: 1.5, px: 2, py: 1.5,
                      cursor: isUnread || NOTIFICATION_LINK[n.type] ? 'pointer' : 'default',
                      bgcolor: (t) => (isUnread ? alpha(t.palette.primary.main, 0.06) : 'transparent'),
                    }}
                  >
                    <Box sx={{ color: isUnread ? 'primary.main' : 'text.disabled', pt: 0.25 }}>
                      {TYPE_ICON[n.type] || <Notifications fontSize="small" />}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={isUnread ? 700 : 500}>{n.title}</Typography>
                      {n.message && (
                        <Typography variant="body2" color="text.secondary">{n.message}</Typography>
                      )}
                      <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'none', letterSpacing: 0 }}>
                        {timeAgo(n.created_at)}
                      </Typography>

                      {pendingRequest && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={(e) => { e.stopPropagation(); setAnchorEl(null); setReviewId(n.ref_id); }}
                          >
                            Revisar y responder
                          </Button>
                        </Box>
                      )}
                      {n.type === 'log_share_request' && SHARE_STATUS_LABEL[n.share_status] && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textTransform: 'none', letterSpacing: 0 }}>
                          {SHARE_STATUS_LABEL[n.share_status]}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Popover>

      <ShareReviewDialog
        key={reviewId || 'none'}
        open={!!reviewId}
        shareId={reviewId}
        onClose={() => { setReviewId(null); loadList(); }}
        onRejected={handleRejected}
      />

      <Snackbar
        open={!!notice}
        autoHideDuration={6000}
        onClose={(_, reason) => { if (reason !== 'clickaway') setNotice(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notice ? (
          <Alert severity={notice.severity} variant="filled" onClose={() => setNotice(null)} sx={{ width: '100%' }}>
            {notice.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
