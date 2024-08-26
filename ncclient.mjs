import {PerTabAuthStore} from "./pertabstorage.mjs";
//import PocketBase from 'pocketbase';
import PocketBase from './node_modules/pocketbase/dist/pocketbase.es.mjs';

const pb = new PocketBase('http://192.168.1.199:9002', new PerTabAuthStore());

export async function createAnonymousUser() { 
    const password = 'ukelele78'

    const record = await pb.collection('users').create({
        password: password,
        passwordConfirm: password,
    });
    // console.log(record);

    const authData = pb.collection('users').authWithPassword(
        record.username,
        password,
    );
    return authData;
}

export async function ensureLoggedInUser() {
    if (pb.authStore.isValid) {return}
    else {return createAnonymousUser()}
}
// after the above you can also access the auth data from the authStore
//console.log(pb.authStore.isValid);
//console.log(pb.authStore.token);
//console.log(pb.authStore.model.id);
export function getUserId() {
    return pb.authStore.model.id;
}

export async function createGame(d, s, ls) {
    let code = 0;
    while (true) {
        code = Math.round(1000000*Math.random())
        const formattedcode = `${code.toString().padStart(6, '0')}`

        const data = {
            "creator": pb.authStore.model.id,
            "difficulty": d,
            "seed": s,
            "code": formattedcode,
            "levelseq": ls
        };

        try {
            return await pb.collection('games').create(data);
        } catch (er) {
            if (er.response?.data?.code?.code === 'validation_not_unique') {
                continue
            };
            throw er
        }
    };
}

export async function joinGame(code, name) {
    const record = await pb.collection('games').getFirstListItem(`code="${code}"`, {
    });
    console.log(record)
    const data = {
        "user": pb.authStore.model.id,
        "game": record.id, 
    }
    await pb.collection('users').update(data.user, {name});
    const retur = {
        game: record,
        game_user: await pb.collection('game_users').create(data)
    }
    return retur;
}

export async function kickUser(gameUserId) {
    return pb.collection('game_users').delete(gameUserId);
}

export async function updateStartTime(recordID,time, firstlevel) {
    const data = {
        "starttime": time,
        "level": firstlevel
    };

    return await pb.collection('game_users').update(recordID, data);
}

export async function updateCurrentLevel(recordID,level) {
    const data = {
        "level": level
    };

    return await pb.collection('game_users').update(recordID, data);
}

export async function updateEndTime(recordID,time) {
    const data = {
        "endtime": time
    };

    return await pb.collection('game_users').update(recordID, data);
}

export async function getScoreboard(gameID) {
    return pb.collection('scoreboard').getFullList({
        filter: `game = "${gameID}"`,
    });
}

export async function subscribeToUpdate(gameID, callback) {
    return pb.collection('game_users').subscribe('*', callback, { 
        filter: `game = "${gameID}"`,
    });
}

export function failureAlert(er, id) {
    document.getElementById(id).innerHTML=
      `<div class="alert alert-warning alert-dismissible fade show" 
      role="alert">${er.message || er}<button type="button" class="btn-close" 
      data-bs-dismiss="alert"aria-label="Close"></button></div>`
}
