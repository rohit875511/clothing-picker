# Clothing Picker App

A web application to manage and randomly select clothing items, track wear counts, and filter by type and occasion. Built with React and Firebase (Firestore & Storage).

## Features

Add clothing items with image, type, and occasion

Mark items as worn and track wear count

Filter items by type and occasion

Pick a random item or the least/most worn items

Responsive clothing grid display

##T echnologies

Frontend: React, JavaScript, HTML, CSS

Backend / Database: Firebase Firestore, Firebase Storage

Hosting: Firebase Hosting

## Installation / Setup

Clone the repository

git clone https://github.com/rohit875511/clothing-picker.git
cd clothing-picker


## Install dependencies

npm install

## Configure Firebase

Create a Firebase project at https://console.firebase.google.com

Enable Firestore Database and Storage

Copy your Firebase config into src/firebase.js:

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);


## Run locally

npm start

Opens the app in your default browser at http://localhost:3000

## Usage

Add Item: Select an image, choose a type and occasion, click “Add Item”

Mark as Worn: Click “Mark as Worn” under any item

Pick Random: Select a random item from your collection

Pick Least/Most Worn: Display a sorted list of items by wear count

Filter: Use the type and occasion filters to narrow the displayed items

## Deployment

Make sure your Firebase project is configured and initialized:

firebase init hosting
npm run build
firebase deploy
