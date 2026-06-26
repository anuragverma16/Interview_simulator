import { useEffect, useState, useMemo, useCallback, type Dispatch, type MouseEvent as ReactMouseEvent, type SetStateAction } from 'react';

import { Link } from 'react-router-dom';

import { Bell, Flame, Clock, Inbox, MessageSquare, X } from 'lucide-react';

import type { CodingStreakData } from '../../types';

import {

  buildNotifications,

  formatExpiresIn,

  mapUserNotifications,

  getDismissedNotificationIds,

  dismissNotificationIds,

  isNotificationUnread,

  type UserNotificationRecord,

} from '../../utils/notifications';

import { notificationApi } from '../../services/api';

import { cn } from '../../utils/cn';



interface Props {

  streakData: CodingStreakData | null;

}



function dismissStreakNotifications(streakData: CodingStreakData | null, setDismissed: Dispatch<SetStateAction<Set<string>>>) {

  const streakIds = buildNotifications(streakData).map((n) => n.id);

  if (streakIds.length === 0) return;

  dismissNotificationIds(streakIds);

  setDismissed((prev) => {

    const next = new Set(prev);

    streakIds.forEach((id) => next.add(id));

    return next;

  });

}



export default function NavbarNotifications({ streakData }: Props) {

  const [open, setOpen] = useState(false);

  const [adminNotes, setAdminNotes] = useState<UserNotificationRecord[]>([]);

  const [dismissed, setDismissed] = useState<Set<string>>(() => getDismissedNotificationIds());

  const [seenThisSession, setSeenThisSession] = useState<Set<string>>(() => new Set());



  const streakNotes = useMemo(() => buildNotifications(streakData), [streakData]);

  const adminMapped = useMemo(() => mapUserNotifications(adminNotes), [adminNotes]);

  const notifications = useMemo(

    () => [...adminMapped, ...streakNotes].sort(

      (a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime()

    ),

    [adminMapped, streakNotes]

  );



  const visibleNotifications = useMemo(

    () => notifications.filter((n) => {

      if (n.type === 'admin_message') return !n.dismissed;

      return !dismissed.has(n.id);

    }),

    [notifications, dismissed]

  );



  const unreadCount = useMemo(

    () => visibleNotifications.filter((n) => {

      if (seenThisSession.has(n.id)) return false;

      return isNotificationUnread(n, dismissed);

    }).length,

    [visibleNotifications, dismissed, seenThisSession]

  );



  const loadAdminNotes = useCallback(async (): Promise<UserNotificationRecord[]> => {

    try {

      const { data } = await notificationApi.getMine();

      const items: UserNotificationRecord[] = data.data || [];

      setAdminNotes(items);

      return items;

    } catch {

      setAdminNotes([]);

      return [];

    }

  }, []);



  const markPanelAsSeen = useCallback(async () => {

    const ids = visibleNotifications.map((n) => n.id);

    setSeenThisSession((prev) => {

      const next = new Set(prev);

      ids.forEach((id) => next.add(id));

      return next;

    });

    setAdminNotes((prev) => prev.map((n) => ({ ...n, read: true })));

    dismissStreakNotifications(streakData, setDismissed);



    try {

      await notificationApi.markAllRead();

    } catch {

      /* keep optimistic UI */

    }

  }, [visibleNotifications, streakData]);



  const dismissOne = useCallback(async (notificationId: string, type: string, e?: ReactMouseEvent) => {

    e?.preventDefault();

    e?.stopPropagation();

    setSeenThisSession((prev) => new Set(prev).add(notificationId));

    if (type === 'admin_message') {

      const dbId = notificationId.replace('admin-', '');

      try {

        await notificationApi.dismiss(dbId);

        setAdminNotes((prev) => prev.filter((n) => n._id !== dbId));

      } catch {

        /* ignore */

      }

    } else {

      dismissNotificationIds([notificationId]);

      setDismissed((prev) => new Set(prev).add(notificationId));

    }

  }, []);



  const markOneAsSeen = useCallback(async (notificationId: string, type: string) => {

    setSeenThisSession((prev) => new Set(prev).add(notificationId));

    if (type === 'admin_message') {

      const dbId = notificationId.replace('admin-', '');

      try {

        await notificationApi.markRead(dbId);

        setAdminNotes((prev) => prev.map((n) => (n._id === dbId ? { ...n, read: true } : n)));

      } catch {

        /* ignore */

      }

    } else {

      dismissNotificationIds([notificationId]);

      setDismissed((prev) => new Set(prev).add(notificationId));

    }

  }, []);



  useEffect(() => {

    loadAdminNotes();

    const id = setInterval(loadAdminNotes, 30000);

    return () => clearInterval(id);

  }, [loadAdminNotes]);



  useEffect(() => {

    if (streakData?.todaySolved) {

      loadAdminNotes();

    }

  }, [streakData?.todaySolved, loadAdminNotes]);



  useEffect(() => {

    if (!open) return;

    const close = (e: MouseEvent) => {

      const target = e.target as Node;

      if (!(target as Element).closest?.('[data-notifications-root]')) setOpen(false);

    };

    document.addEventListener('mousedown', close);

    return () => document.removeEventListener('mousedown', close);

  }, [open]);



  const handleOpenPanel = () => {

    if (open) {

      setOpen(false);

      return;

    }

    setOpen(true);

    markPanelAsSeen();

  };



  const handleNotificationClick = async (id: string, type: string) => {

    await markOneAsSeen(id, type);

    setOpen(false);

  };



  return (

    <div className="relative" data-notifications-root>

      <button

        type="button"

        onClick={handleOpenPanel}

        className={cn(

          'relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors',

          unreadCount > 0

            ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'

            : 'border-themed bg-white/5 text-muted hover:text-themed hover:border-purple-500/30'

        )}

        aria-label="Notifications"

      >

        <Bell className="h-4 w-4" />

        {unreadCount > 0 && (

          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-[var(--bg-page)]">

            {unreadCount > 9 ? '9+' : unreadCount}

          </span>

        )}

      </button>



      {open && (

        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-themed bg-themed-elevated shadow-xl z-50 overflow-hidden">

          <div className="flex items-center justify-between px-3 py-2.5 border-b border-themed">

            <p className="text-sm font-semibold text-themed">Notifications</p>

          </div>



          <div className="max-h-64 overflow-y-auto">

            {visibleNotifications.length === 0 ? (

              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">

                <Inbox className="h-8 w-8 text-muted mb-2 opacity-50" />

                <p className="text-sm font-medium text-themed-secondary">No notifications</p>

                <p className="text-xs text-muted mt-1">You&apos;re all caught up!</p>

              </div>

            ) : (

              <ul className="divide-y divide-themed">

                {visibleNotifications.map((n) => {

                  const unread = !seenThisSession.has(n.id) && isNotificationUnread(n, dismissed);

                  return (

                    <li

                      key={n.id}

                      className={cn(

                        'p-3 hover:bg-themed-hover transition-colors relative',

                        !unread && 'opacity-75'

                      )}

                    >

                      <button

                        type="button"

                        onClick={(e) => dismissOne(n.id, n.type, e)}

                        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-md text-muted hover:text-themed hover:bg-black/5 dark:hover:bg-white/10 transition-colors"

                        aria-label="Dismiss notification"

                      >

                        <X className="h-3.5 w-3.5" />

                      </button>

                      <div className="flex gap-2 pr-6">

                        <div className={cn(

                          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',

                          n.type === 'admin_message'

                            ? n.kind === 'daily_problem'

                              ? 'bg-orange-500/15 text-orange-500'

                              : 'bg-purple-500/15 text-purple-400'

                            : n.type === 'daily_streak'

                              ? 'bg-orange-500/15 text-orange-500'

                              : 'bg-amber-500/15 text-amber-500'

                        )}>

                          {n.type === 'admin_message' ? (

                            n.kind === 'daily_problem' ? (

                              <Flame className="h-3.5 w-3.5" />

                            ) : (

                              <MessageSquare className="h-3.5 w-3.5" />

                            )

                          ) : (

                            <Flame className="h-3.5 w-3.5" />

                          )}

                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="text-xs font-semibold text-themed leading-tight flex items-center gap-1.5">

                            {n.title}

                            {unread && <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />}

                          </p>

                          {n.fromAdminName && (

                            <p className="text-[10px] text-purple-500/80 dark:text-purple-400/80 mt-0.5">

                              From admin · {n.fromAdminName}

                            </p>

                          )}

                          <p className="text-[11px] text-muted mt-1 line-clamp-2">{n.message}</p>

                          <p className="flex items-center gap-1 text-[10px] text-muted mt-1.5">

                            <Clock className="h-3 w-3" />

                            {formatExpiresIn(n.expiresAt)}

                          </p>

                          <Link

                            to={n.kind === 'daily_problem' ? '/coding/daily?start=1' : n.actionUrl}

                            onClick={() => handleNotificationClick(n.id, n.type)}

                            className="inline-block mt-2 text-[11px] font-medium text-purple-500 dark:text-purple-400 hover:underline"

                          >

                            {n.actionLabel} →

                          </Link>

                        </div>

                      </div>

                    </li>

                  );

                })}

              </ul>

            )}

          </div>

        </div>

      )}

    </div>

  );

}


