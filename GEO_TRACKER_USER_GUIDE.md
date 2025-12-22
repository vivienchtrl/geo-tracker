# 🤖 Geo Tracker - User Setup Guide

## ⚡ The Quick Version

**Bots are tracked automatically.** No code needed! ✅

If you want to track humans too, add **one line**:

```html
<script src="https://yourdomain.com/tracker.min.js?p=YOUR_PROJECT_ID"></script>
```

Done! 🎉

---

## 📊 What Gets Tracked

### Automatically (No setup needed)
- ✅ ChatGPT visits your site
- ✅ Claude browses your content  
- ✅ Perplexity crawls your pages
- ✅ Google/Bing index your site
- ✅ Apple Intelligence accesses your pages
- ✅ Other bots and crawlers

### Optional (Add 1 line if you want)
- 📝 Human visitor analytics
- 📝 Page views and paths
- 📝 Referrer information

---

## 🚀 Setup (Choose One)

### Option 1: Zero Setup (Recommended) ⭐
```
Just wait. Bots are tracked automatically!
```

### Option 2: Basic Human Tracking
Add this ONE line to your `<head>`:
```html
<script src="https://yourdomain.com/tracker.min.js?p=YOUR_PROJECT_ID"></script>
```

Replace `YOUR_PROJECT_ID` with your actual project ID from Geo Tracker.

---

## 💡 How It Works

### For Bots
```
Bot visits your site
    ↓
Server detects User-Agent (GPTBot, Claude-Web, etc.)
    ↓
Automatically logged in [BOT-DETECTED]
    ↓
You see: "ChatGPT visited /products at 3:30 PM"
```

### For Humans (Optional)
```
Human loads your page with tracker.min.js
    ↓
Script sends minimal data (path, title, referrer)
    ↓
Tracked in your database
    ↓
You see analytics in your dashboard
```

---

## 🔍 What Data Is Captured

### Automatic Bot Tracking
- ✅ Bot name (ChatGPT, Claude, Perplexity, etc.)
- ✅ URL path they visited
- ✅ Timestamp
- ✅ Approximate location (from IP)

### Optional Human Tracking
- ✅ Page path
- ✅ Page title
- ✅ Referrer (where they came from)
- ✅ User-Agent (browser info)

---

## 🛡️ Privacy & Security

- **No cookies used** ✅
- **No personal data stored** ✅
- **IP hashed for privacy** ✅
- **Server-side bot detection** (can't be spoofed) ✅
- **GDPR compliant** ✅

---

## ❓ FAQ

**Q: Do I need to modify my HTML?**  
A: No! Bots are tracked automatically. Optional: Add 1 line for human analytics.

**Q: Will this slow down my site?**  
A: No. Bot tracking is server-side (<1ms overhead).

**Q: What bots are tracked?**  
A: ChatGPT, Claude, Perplexity, Google, Bing, Apple, and 15+ others.

**Q: Can bots opt-out?**  
A: They're tracked regardless (server-side, they can't disable it).

**Q: Do I need a robots.txt?**  
A: We provide one that allows all major AI crawlers. Use it!

---

## 📞 Support

Questions? Check:
1. Your project ID in Geo Tracker dashboard
2. robots.txt is deployed (`yourdomain.com/robots.txt`)
3. tracker.min.js is accessible if you added it

---

**That's it! Enjoy tracking AI bots! 🚀**

