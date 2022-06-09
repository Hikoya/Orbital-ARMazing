## Overview

This repo holds source code for ARMazing Web Application. Project is built on top of https://nextjs.org and Chakra-UI to allow easy contributions be it to code or other areas of the website.

## Getting Started

- Install latest (LTS) version of NodeJS
- Verify your installation by running node -v; npm -v command in your terminal / command line, you should see 2 version outputs
- Install project dependencies by running npm i from project root
- Run npm run dev and start building awesome things!

## Commands

    npm run clean - Cleans build artifacts
    npm run dev - Starts project locally (localhost:3000) and recompiles on source code changes
    npm run build - Builds static assets into out folder
    npm run start - Serves static assets from out folder
    npm run prettier - Prettify code
    npm run lint - Checks code for correct formating

## Project Structure

- public - Public / static assets for images etc...
- src/components - Basic & reusable components like cards, text, icon etc...
- src/pages - Individual website pages. \_app is a special file for editing global settings
- src/layout - Main layout of the page, with sidebar and drawers
- src/constants - Any constants that are not stored in the database
- src/helper - Helper functions such as calls to database, prettify strings etc.
- src/styles - Certain styling files such as the one used for calendars
- src/types - Types for TypeScript

## Tech Stack

- NextJS - React Framework for Production
- Chakra-UI - Component library
- Prisma - ORM to define data models and their relations
- PlanetScale - MySQL-compatible serverless database platform

## Libraries

Further add ons as necessary

**Necessary**

- Next-Auth - Authentication library
- Prisma - ORM library for database
- Formidable - Library to parse form uploads with files
- Nodemailer - Library to send out emails
- React - Frontend necessity

**Styling**

- Chakra-UI - Component Library
- Emotion - Styling
- Framer-Motion - Animation
- React-Icons - Library for Icons

**Component**

- React-Table - Table

**Utilities**

- ESlint - Code formatter and checker
- Sharp - High-performance image processing
