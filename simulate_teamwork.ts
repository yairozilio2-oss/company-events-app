const API_URL = 'http://localhost:3001/api';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSimulation() {
  console.log('🚀 מתחיל סימולציית סוכנים...');
  
  try {
    console.log('👤 סוכן מנהל: יוצר אירוע חדש...');
    const eventRes = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'כנס חברה שנתי 2026',
        date: '2026-10-15T00:00:00Z',
        location: 'מלון דן אילת'
      })
    });
    const eventData: any = await eventRes.json();
    const eventId = eventData.id;
    console.log(`✅ אירוע נוצר בהצלחה (ID: ${eventId})`);

    console.log('👥 סוכני משתמשים: נרשמים למערכת...');
    const users = [
      { email: 'agent1@company.com', password: 'Password123!', name: 'דניאל (סוכן)' },
      { email: 'agent2@company.com', password: 'Password123!', name: 'יוסי (סוכן)' },
      { email: 'agent3@company.com', password: 'Password123!', name: 'מיכל (סוכנת)' }
    ];

    for (const u of users) {
      await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(u)
      });
      await delay(500);
      console.log(`✅ סוכן נרשם: ${u.name}`);
    }

    console.log('👤 סוכן מנהל: מריץ שיבוץ אוטומטי (Auto-Allocation)...');
    await fetch(`${API_URL}/allocate/auto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId })
    });
    console.log('✅ שיבוץ אוטומטי הושלם.');

    console.log('👤 סוכן מנהל: מושך דוח תפוסה לוודא שהנתונים התקבלו כראוי...');
    const reportRes = await fetch(`${API_URL}/reports/occupancy?eventId=${eventId}`);
    const reportData: any = await reportRes.json();
    console.log('📊 דוח תפוסה מנהל:');
    console.log(JSON.stringify(reportData, null, 2));

    console.log('🎉 סימולציית סוכנים הושלמה בהצלחה!');

  } catch (error: any) {
    console.error('❌ שגיאה בסימולציה:', error.message);
  }
}

runSimulation();
