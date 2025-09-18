# PSGMX-Leetboard – Explanation

## 🌐 What it is

PSGMX-Leetboard is a **web dashboard** that shows the coding progress of all students.
It works completely **online (client-side only)** – no separate server is required.

---
![Dashboard Preview](public/image.png)

## ⚡ How it works

1. **Data Storage** → Student details (name, roll no, class, etc.) are stored in **Supabase** (an online SQL postgres database).
2. **LeetCode Stats** → The app connects to our own LeetCode API to fetch each student’s problem-solving progress.
3. **Problem of the Day (POTD)** → Every day, it fetches the daily challenge from LeetCode and displays it as a banner.
4. **Leaderboard** →
   * Students are ranked **weekly** (based on problems solved this week).
   * Students are ranked **overall** (based on total problems solved).
5. **User Cards** → Each student appears as a card with their details. Clicking on a card opens a **profile modal** showing detailed stats.
6. **Refresh Button** → Any student’s data can be refreshed instantly without reloading the whole page.
7. **Charts & Group Stats** → The dashboard also shows:
   * Group G1 vs Group G2 performance
   * Total progress of all students
   * Top performers (weekly + overall)

---

## 🎨 User Experience

* **Search & Filter** → Quickly find a student by name/roll number, or filter by class.
* **Pagination** → Students are shown page by page for smooth browsing.
* **Responsive** → Works on laptop and mobile screens.
* **Animations** → Smooth transitions using Framer Motion.

---

## 🛠️ Technology Used (just for awareness)

* **Frontend**: React (Next.js)
* **Database**: Supabase (online database)
* **Charts**: Recharts
* **UI Design**: TailwindCSS + shadcn/ui
* **Hosting**: Vercel (free hosting)

---

✅ In short:
The app takes student details from Supabase → fetches live LeetCode data → calculates ranks → shows them in a beautiful dashboard with leaderboards, group stats, and problem of the day.

---

## 🤝 Contributing

Contributions are welcome! 🎉  
If you'd like to improve PSGMX-Leetboard, here are some ways you can help:

- 🐛 **Report Bugs** → Found an issue? Please open an [Issue](../../issues).
- ✨ **Suggest Features** → Have an idea to make it better? Share it in Issues or Discussions.
- 💻 **Code Contributions** → Pick an open issue or create a new feature:
  1. Fork the repo
  2. Create a new branch (`git checkout -b feature-branch`)
  3. Make your changes
  4. Commit (`git commit -m "Add feature XYZ"`)
  5. Push (`git push origin feature-branch`)
  6. Open a Pull Request 🎯

---

### Good first contributions

Some simple areas to start with:
- Improve UI/UX (styling, mobile responsiveness)
- Add more statistics or charts
- Improve performance (pagination, caching, etc.)
- Write better documentation

---

## - From – 25MXians  
*Let's grow together ✨* 