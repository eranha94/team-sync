export type Language = "he" | "en";

export const translations = {
  he: {
    common: {
      hebrew: "עברית",
      english: "English",
      loading: "טוען...",
      save: "שמור",
      cancel: "ביטול",
      refresh: "רענון",
      close: "סגור",
      confirm: "אישור",
      yes: "כן",
      no: "לא",
    },

    navigation: {
      dashboard: "ראשי",
      polls: "סקרים",
      calendar: "לוח שנה",
      members: "שחקנים",
      statistics: "סטטיסטיקות",
      settings: "הגדרות",
    },

    login: {
      secureLogin: "כניסה מאובטחת",
      subtitle: "הזן מספר טלפון וקוד אישי כדי להיכנס למערכת.",
      loginTitle: "כניסה למערכת",
      membersOnly: "הכניסה זמינה לחברי הקבוצה בלבד",
      phone: "מספר טלפון",
      pin: "קוד אישי",
      pinHint: "הקוד האישי כולל 4 עד 6 ספרות",
      loginButton: "כניסה למערכת",
      loggingIn: "מאמת פרטים...",
      notMember: "עדיין לא חבר בקבוצה?",
      registerRequest: "שליחת בקשת הצטרפות",
      secureNote: "טלפון וקוד אישי נבדקים בצורה מאובטחת",
    },

    register: {
      title: "בקשת הצטרפות",
      subtitle:
        "מלא את הפרטים, בחר עמדות וקוד אישי. הכניסה תתאפשר לאחר אישור מנהל הקבוצה.",
      fullName: "שם מלא",
      fullNamePlaceholder: "שם פרטי ומשפחה",
      phone: "מספר טלפון",
      positions: "עמדות משחק",
      multiplePositions: "ניתן לבחור יותר מעמדה אחת",
      selected: "נבחרו",
      chooseOnePosition: "יש לבחור לפחות עמדה אחת",
      pin: "קוד אישי",
      confirmPin: "אימות קוד אישי",
      submit: "שליחת בקשת הצטרפות",
      submitting: "שולח בקשה...",
      pendingNote:
        "ההרשמה אינה מאפשרת כניסה אוטומטית. מנהל הקבוצה צריך לאשר את הבקשה תחילה.",
      alreadyRegistered: "כבר רשום?",
      goToLogin: "מעבר לכניסה",
      requestSent: "הבקשה נשלחה",
      requestSentDescription:
        "הבקשה שלך ממתינה לאישור מנהל הקבוצה. לאחר האישור יהיה ניתן להיכנס באמצעות מספר הטלפון והקוד האישי שבחרת.",
    },

    positions: {
      goalkeeper: "שוער",
      center_back: "בלם",
      full_back: "מגן",
      defensive_midfielder: "קשר אחורי",
      midfielder: "קשר",
      winger: "כנף",
      striker: "חלוץ",
    },

    dashboard: {
      greeting: "שלום",
      subtitle: "הנה תמונת המצב של הקבוצה",
      activeMembers: "חברי קבוצה פעילים",
      answered: "ענו לסקר",
      waiting: "טרם ענו",
      responseRate: "אחוז היענות",
      openPoll: "הסקר הפתוח",
      progress: "התקדמות המענה",
      fillPoll: "מעבר למילוי הסקר",
      closePoll: "סגירת הסקר",
      noOpenPoll: "אין כרגע סקר פתוח",
    },
  },

  en: {
    common: {
      hebrew: "עברית",
      english: "English",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      refresh: "Refresh",
      close: "Close",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
    },

    navigation: {
      dashboard: "Dashboard",
      polls: "Polls",
      calendar: "Calendar",
      members: "Players",
      statistics: "Statistics",
      settings: "Settings",
    },

    login: {
      secureLogin: "Secure login",
      subtitle: "Enter your phone number and personal PIN to sign in.",
      loginTitle: "Sign in",
      membersOnly: "Access is available to team members only",
      phone: "Phone number",
      pin: "Personal PIN",
      pinHint: "The PIN must contain 4 to 6 digits",
      loginButton: "Sign in",
      loggingIn: "Verifying details...",
      notMember: "Not a team member yet?",
      registerRequest: "Send a join request",
      secureNote: "Your phone number and PIN are verified securely",
    },

    register: {
      title: "Join request",
      subtitle:
        "Enter your details, choose your positions and set a personal PIN. Access will be available after admin approval.",
      fullName: "Full name",
      fullNamePlaceholder: "First and last name",
      phone: "Phone number",
      positions: "Playing positions",
      multiplePositions: "You can select more than one position",
      selected: "Selected",
      chooseOnePosition: "Select at least one position",
      pin: "Personal PIN",
      confirmPin: "Confirm PIN",
      submit: "Send join request",
      submitting: "Sending request...",
      pendingNote:
        "Registration does not grant immediate access. A team admin must approve the request first.",
      alreadyRegistered: "Already registered?",
      goToLogin: "Go to login",
      requestSent: "Request sent",
      requestSentDescription:
        "Your request is waiting for admin approval. Once approved, you can sign in using your phone number and the PIN you selected.",
    },

    positions: {
      goalkeeper: "Goalkeeper",
      center_back: "Center back",
      full_back: "Full back",
      defensive_midfielder: "Defensive midfielder",
      midfielder: "Midfielder",
      winger: "Winger",
      striker: "Striker",
    },

    dashboard: {
      greeting: "Hello",
      subtitle: "Here is the current team overview",
      activeMembers: "Active team members",
      answered: "Answered",
      waiting: "Waiting",
      responseRate: "Response rate",
      openPoll: "Open poll",
      progress: "Response progress",
      fillPoll: "Open poll",
      closePoll: "Close poll",
      noOpenPoll: "There is no open poll",
    },
  },
} as const;

export type TranslationDictionary =
  (typeof translations)[Language];