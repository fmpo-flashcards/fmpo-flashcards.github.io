// ===========================================================================
//  FMPO Flashcards — configuration Firebase (projet dédié)
//  Projet : fmpo-flashcards | Compte : anzajewls@gmail.com
//  Créé le 2026-10-17. Auth Email/Password + Google activés, Firestore europe-west1.
// ===========================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyCBzr9P924fcjlSeNTcj4aLR9wIAX9szjA",
  authDomain: "fmpo-flashcards.firebaseapp.com",
  projectId: "fmpo-flashcards",
  storageBucket: "fmpo-flashcards.firebasestorage.app",
  messagingSenderId: "508196814300",
  appId: "1:508196814300:web:b03e5058e41e6719d9a319"
};

// Email de l'administrateur — seul cet email peut générer des codes.
// DOIT correspondre à la valeur isAdmin() dans firestore.rules
export const ADMIN_EMAIL = "anzajewls@gmail.com";
