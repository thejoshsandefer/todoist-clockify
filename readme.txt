# Todoist Clockify Chrome Extension

This repository contains a simple Chrome extension that injects Clockify time-entry fields into Todoist's web interface.

## Features

 - Adds a duration field to the Todoist task details sidebar that accepts plain language entries like `30m` or `1h`.
 - Provides a searchable project input in the task details sidebar backed by projects from your Clockify workspace.
 - Sends the captured time entry to Clockify when the **Log** button is pressed, using the Todoist task title as the entry description.

## Setup

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked** and choose this folder.
4. Open the extension's options page and enter your Clockify API key and workspace ID.
 5. Navigate to Todoist, open a task, and the details sidebar will display Clockify controls.
