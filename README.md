This application is the first of its kind and is called OCRganise. We scan, split, and supervise. It is a one-stop application that allows you to scan your bill and add a split with your friends in one application.

The frontend has been hosted in Vercel at https://v0-homepagewithauth-ddft3s.vercel.app/

The backend has been hosted in Render at https://cortelix-backend-1.onrender.com

##Inspiration
The idea for **OCRganise** came from personal experience living with friends and constantly needing to split grocery bills. Manually entering expenses into different apps was frustrating and time-consuming. I wanted a single solution that could handle it all: scan receipts, split costs, and track expenses intelligently. That’s where the idea for a smart, unified expense management app came from.

##What it does
OCRganise is a smart expense tracker, bill scanner, and cost splitter all rolled into one.
-Users can upload or take a photo of their receipts.
-The app uses OCR (Optical Character Recognition) to extract items and prices.
-You can then split the total (or individual items) with friends.
-It also tracks your personal and shared expenses over time.
-It’s designed to be intuitive, fast, and accurate, making group expenses hassle-free.

##How we built it
OCRganise is a Progressive Web App (PWA), so it works seamlessly on both phones and browsers.

**Frontend**: Built with Next.js for responsiveness and ease of use.
**Backend**: Powered by Gemini AI to categorize and process scanned items intelligently.
**OCR**: Uses TabScanner OCR for extracting text from receipts.
**Database**: MongoDB stores user data, receipt details, and expense tracking information.

##Challenges we ran into
-Handling item splitting dynamically across multiple users was trickier than expected.
-Making it work smoothly as a PWA involved debugging service worker issues for offline caching and performance.

##Accomplishments that we're proud of
Successfully integrated OCR with receipt scanning and expense tracking in one flow.
-Built a full-stack PWA that works across devices.
-Created a user-friendly interface for splitting expenses—no calculator required!
-Used AI to make the categorization process smart and scalable.



