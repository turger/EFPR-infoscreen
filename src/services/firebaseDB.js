import {ref, get} from 'firebase/database';
import {getFirebaseDB} from './firebaseInit';

const db = getFirebaseDB();

export const getInfoNotes = () =>
    get(ref(db, 'infonotes')).then((snap) => snap.val());
