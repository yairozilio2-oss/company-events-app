'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDeadline, setEventDeadline] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [occupancyReport, setOccupancyReport] = useState<any>({ rooms: [], unassigned: [] });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadEvents();
    loadNotifications();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
        if (data.length > 0 && !selectedEventId) {
          setSelectedEventId(data[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const loadOccupancyReport = async (eventId: string) => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/reports/occupancy?eventId=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setOccupancyReport(data);
      }
    } catch (err) {
      console.error('Failed to load occupancy report:', err);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadOccupancyReport(selectedEventId);
    }
  }, [selectedEventId]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: eventName,
          date: eventDate,
          location: eventLocation,
          deadline: eventDeadline || undefined
        })
      });
      if (res.ok) {
        setMessage('האירוע נוצר בהצלחה');
        setEventName('');
        setEventDate('');
        setEventLocation('');
        setEventDeadline('');
        loadEvents();
      } else {
        const data = await res.json();
        setMessage(`שגיאה: ${data.error}`);
      }
    } catch (err) {
      setMessage('שגיאה ביצירת אירוע');
    }
  };

  const triggerAutoAllocation = async () => {
    if (!selectedEventId) return;
    try {
      const res = await fetch('/api/allocate/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEventId })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('הקצאת חדרים אוטומטית הושלמה בהצלחה!');
        loadOccupancyReport(selectedEventId);
        loadNotifications();
      } else {
        setMessage(`שגיאה: ${data.error}`);
      }
    } catch (err) {
      setMessage('שגיאה בהפעלת הקצאה אוטומטית');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans" dir="rtl">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
          ממשק ניהול – הקצאת חדרים
        </h1>
        <div className="flex gap-4">
          <button onClick={() => { loadEvents(); loadNotifications(); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm transition">
            רענן נתונים
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Event Creation & Action */}
        <div className="space-y-8 lg:col-span-1">
          <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-teal-400 border-b border-slate-800 pb-2">יצירת אירוע חדש</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">שם האירוע</label>
                <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500" value={eventName} onChange={e => setEventName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">תאריך</label>
                <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">מיקום</label>
                <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500" value={eventLocation} onChange={e => setEventLocation(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">דדליין לרישום (אופציונלי)</label>
                <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500" value={eventDeadline} onChange={e => setEventDeadline(e.target.value)} />
              </div>
              <button type="submit" className="w-full py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold rounded-lg hover:from-teal-400 hover:to-cyan-400 transition shadow-lg shadow-teal-500/20">
                צור אירוע
              </button>
            </form>
            {message && <p className="mt-4 text-center text-sm font-medium text-cyan-400">{message}</p>}
          </div>

          <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-teal-400 border-b border-slate-800 pb-2">פעולות מנהל</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">בחר אירוע לשיבוץ ודיווח</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500" value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name} ({ev.location})</option>
                  ))}
                </select>
              </div>
              <button onClick={triggerAutoAllocation} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 border border-teal-500/30 font-bold rounded-lg transition shadow-lg">
                הפעל שיבוץ חדרים אוטומטי
              </button>
            </div>
          </div>
        </div>

        {/* Right columns - Report and Notification log */}
        <div className="space-y-8 lg:col-span-2">
          {/* Occupancy Report */}
          <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-teal-400 border-b border-slate-800 pb-2 flex justify-between items-center">
              <span>דוח תפוסה ושיבוצים</span>
              <span className="text-xs bg-teal-500/10 text-teal-400 px-2 py-1 rounded-full">
                {occupancyReport.rooms.length} חדרים מוגדרים
              </span>
            </h2>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {occupancyReport.rooms.map((room: any) => (
                <div key={room.id} className="border border-slate-800 bg-slate-900/50 p-4 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-slate-700 transition">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <span>חדר מספר {room.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${room.gender === 'M' ? 'bg-blue-500/10 text-blue-400' : room.gender === 'F' ? 'bg-pink-500/10 text-pink-400' : 'bg-purple-500/10 text-purple-400'}`}>
                        מגדר: {room.gender === 'M' ? 'גברים' : room.gender === 'F' ? 'נשים' : 'מעורב'}
                      </span>
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      תפוסה: {room.registrations.length} מתוך {room.capacity} מיטות
                    </p>
                  </div>
                  <div className="flex-1 md:max-w-xs">
                    <h4 className="text-xs text-slate-400 font-semibold mb-1">משתכנים:</h4>
                    {room.registrations.length === 0 ? (
                      <span className="text-sm text-slate-500 italic">חדר ריק</span>
                    ) : (
                      <ul className="space-y-1">
                        {room.registrations.map((reg: any) => (
                          <li key={reg.id} className="text-sm text-teal-300">
                            {reg.user.name} ({reg.user.email})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Unassigned users */}
            {occupancyReport.unassigned.length > 0 && (
              <div className="mt-6 border-t border-slate-800 pt-4">
                <h3 className="text-md font-bold text-yellow-400 mb-3">משתמשים שלא שובצו לחדר ({occupancyReport.unassigned.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {occupancyReport.unassigned.map((reg: any) => (
                    <span key={reg.id} className="text-xs bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded-full border border-yellow-500/20">
                      {reg.user.name} ({reg.user.gender === 'MALE' ? 'גבר' : 'אישה'})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications logs */}
          <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-teal-400 border-b border-slate-800 pb-2">לוג התראות ומיילים שנשלחו</h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {notifications.length === 0 ? (
                <p className="text-slate-500 text-center py-4 italic">לא נשלחו התראות עדיין.</p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-3 border border-slate-800 bg-slate-900/30 rounded-xl flex flex-col gap-1 hover:bg-slate-900/50 transition">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-teal-400">{notif.email}</span>
                      <span className="text-slate-500">{new Date(notif.timestamp).toLocaleTimeString('he-IL')}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-200 mt-1">{notif.subject}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{notif.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
