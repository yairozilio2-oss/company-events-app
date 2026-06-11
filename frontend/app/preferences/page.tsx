'use client';
import { useState, useEffect } from 'react';

export default function Preferences() {
  const [eventId, setEventId] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState('yes'); // yes, no
  const [kosherType, setKosherType] = useState('regular'); // regular, mehudar
  const [arrivalMethod, setArrivalMethod] = useState('shuttle'); // shuttle, independent
  const [lodgingInterest, setLodgingInterest] = useState('yes'); // yes, no
  const [roomType, setRoomType] = useState('double'); // single, double, triple
  const [requestedEmail, setRequestedEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [userGender, setUserGender] = useState('MALE');

  useEffect(() => {
    loadEvents();
    loadUserProfile();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
        if (data.length > 0) {
          setEventId(data[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const loadUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/auth', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Mock get user gender
        const userRes = await fetch('/api/users');
        if (userRes.ok) {
          const users = await userRes.json();
          const me = users.find((u: any) => u.id === data.userId);
          if (me) {
            setUserGender(me.gender);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  const loadPreferences = async () => {
    if (!eventId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/preferences?eventId=${eventId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSentRequests(data.roommateRequests?.sent || []);
        setReceivedRequests(data.roommateRequests?.received || []);
        
        if (data.registration) {
          const reg = data.registration;
          if (reg.specialRequests) {
            try {
              const spec = JSON.parse(reg.specialRequests);
              setAttendance(spec.attendance || 'yes');
              setKosherType(spec.kosherType || 'regular');
              setArrivalMethod(spec.arrivalMethod || 'shuttle');
              setLodgingInterest(spec.lodging || 'yes');
              setRoomType(spec.roomType || 'double');
            } catch (e) {
              // fallback
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadPreferences();
    }
  }, [eventId]);

  const submitPreference = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const specialData = {
        attendance,
        kosherType,
        arrivalMethod,
        lodging: lodgingInterest,
        roomType
      };

      const res = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: parseInt(eventId),
          requestedEmail: requestedEmail || undefined,
          kosherFood: kosherType === 'mehudar',
          arrivalTime: arrivalMethod === 'shuttle' ? 'הסעה' : 'עצמאי',
          specialRequests: JSON.stringify(specialData)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('העדפותיך נשמרו בהצלחה במערכת!');
        setRequestedEmail('');
        loadPreferences();
      } else {
        setMessage(`שגיאה: ${data.error}`);
      }
    } catch (err) {
      setMessage('שגיאה בשמירת ההעדפות');
    }
  };

  const handleAcceptInvite = async (prefId: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/preferences/${prefId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });
      if (res.ok) {
        setMessage('אישרת את השותפות בחדר בהצלחה!');
        loadPreferences();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-8 flex justify-center" dir="rtl">
      <div className="max-w-3xl w-full space-y-8">
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
          פורטל עובד – רישום והעדפות חדר
        </h2>

        <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl font-bold text-teal-400">טופס רישום למחזור ימי עיון</h3>
            <div className="w-full md:w-64">
              <label className="block text-xs text-slate-400 mb-1">בחר מחזור / אירוע</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none" value={eventId} onChange={e => setEventId(e.target.value)}>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name} ({ev.location})</option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={submitPreference} className="space-y-6 border-t border-slate-800/60 pt-6">
            {/* RSVP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2 font-semibold">האם אתה משתתף באירוע?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="attendance" value="yes" checked={attendance === 'yes'} onChange={() => setAttendance('yes')} className="text-teal-500 focus:ring-0" />
                    <span>כן, אני מגיע/ה</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="attendance" value="no" checked={attendance === 'no'} onChange={() => setAttendance('no')} className="text-teal-500 focus:ring-0" />
                    <span>לא מגיע/ה</span>
                  </label>
                </div>
              </div>

              {/* Lodging */}
              <div>
                <label className="block text-sm text-slate-400 mb-2 font-semibold">מעוניין/ת בלינה במלון?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="lodging" value="yes" checked={lodgingInterest === 'yes'} onChange={() => setLodgingInterest('yes')} className="text-teal-500 focus:ring-0" />
                    <span>כן, מעוניין/ת בלינה</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="lodging" value="no" checked={lodgingInterest === 'no'} onChange={() => setLodgingInterest('no')} className="text-teal-500 focus:ring-0" />
                    <span>לא מעוניין/ת</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-800/40 pt-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">העדפת כשרות</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none" value={kosherType} onChange={e => setKosherType(e.target.value)}>
                  <option value="regular">כשרות רגילה</option>
                  <option value="mehudar">כשרות מהודרת</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">אופן הגעה</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none" value={arrivalMethod} onChange={e => setArrivalMethod(e.target.value)}>
                  <option value="shuttle">הסעה מאורגנת</option>
                  <option value="independent">הגעה עצמאית</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">סוג חדר מבוקש</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none" value={roomType} onChange={e => setRoomType(e.target.value)}>
                  <option value="single">חדר יחיד (באישור רפרנט)</option>
                  <option value="double">חדר זוגי (2 דיירים)</option>
                  <option value="triple">חדר טריפל (3 דיירים)</option>
                </select>
              </div>
            </div>

            {/* Roommate invite */}
            {lodgingInterest === 'yes' && roomType !== 'single' && (
              <div className="border-t border-slate-800/40 pt-4 space-y-2">
                <label className="block text-sm text-slate-400 font-semibold">הזמנת שותף/ה לחדר (חייב/ת להיות מאותו המגדר: {userGender === 'MALE' ? 'גבר' : 'אישה'})</label>
                <input type="email" placeholder="הקלד את כתובת האימייל של השותף..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500" value={requestedEmail} onChange={e => setRequestedEmail(e.target.value)} dir="ltr" />
              </div>
            )}

            <button type="submit" className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold rounded-xl hover:from-teal-400 hover:to-cyan-400 transition shadow-lg shadow-teal-500/20">
              שמור והגש העדפות רישום
            </button>
          </form>
          {message && <p className="text-center text-sm font-semibold text-cyan-400">{message}</p>}
        </div>

        {/* Requests Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sent invites */}
          <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-teal-400 mb-4">בקשות שותפים ששלחתי</h3>
            {sentRequests.length === 0 ? (
              <p className="text-slate-500 text-sm italic">לא נשלחו בקשות.</p>
            ) : (
              <ul className="space-y-2">
                {sentRequests.map((pref, i) => (
                  <li key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold">{pref.requested.name}</div>
                      <div className="text-xs text-slate-400">{pref.requested.email}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${pref.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {pref.status === 'approved' ? 'אושר' : 'ממתין לאישור'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Received invites */}
          <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-teal-400 mb-4">בקשות שותפים שהתקבלו</h3>
            {receivedRequests.length === 0 ? (
              <p className="text-slate-500 text-sm italic">אין הזמנות ממתינות.</p>
            ) : (
              <ul className="space-y-2">
                {receivedRequests.map((pref, i) => (
                  <li key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold">{pref.requester.name}</div>
                      <div className="text-xs text-slate-400">{pref.requester.email}</div>
                    </div>
                    {pref.status === 'pending' ? (
                      <button onClick={() => handleAcceptInvite(pref.id)} className="px-3 py-1 bg-teal-500 text-slate-950 text-xs font-bold rounded hover:bg-teal-400 transition">
                        אשר שותפות
                      </button>
                    ) : (
                      <span className="text-xs text-green-400 font-semibold">אושר</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
