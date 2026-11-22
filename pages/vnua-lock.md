---
layout: page
title: Vnua Lock
permalink: /vnua-lock.html
parent: Programs
parent_url: work.html
lead: A voice log for people who build things. Talk while your hands are busy and get a work log back.
image: assets/img/vnua-lock-web.jpg
image_alt: The Vnua Lock web app, with a notes list on the left and a recorder on the right
image_caption: The web version, running in a browser.
facts:
  - label: Status
    value: Web app works. iPhone app in progress.
  - label: Runs on
    value: Any modern browser
  - label: Built with
    value: JavaScript, with Whisper running in the browser
  - label: Privacy
    value: Audio never leaves your device. No accounts.
  - label: Try it
    value: "[Open the web app](https://adrielvent.github.io/jarvis-notes-web/)"
---
## Why I built it

When I'm building something my hands are busy and I don't stop to write notes. So I talk instead, and Vnua Lock turns the recording into a work log. I use it every day for my co-op and my clubs.

## Why it matters on a shop floor

A machinist's hands are full too, and notes that have to be typed usually don't get written. A spoken log with a date on it is the start of a build record: what got done, who did it and when.

## What the web version does

- Records a voice log and transcribes it with Whisper, right in your browser.
- Never uploads your audio. Notes stay in your browser.
- Pulls a summary, key points and action items out of what you actually said. It doesn't make anything up.
- Sorts notes into sections, with tags, date filters and search.

## What it can't do yet

It's English only, and the small Whisper model gets some words wrong, so read a note before you share it. The first recording downloads a 40 MB model, so open it on Wi-Fi the first time.
