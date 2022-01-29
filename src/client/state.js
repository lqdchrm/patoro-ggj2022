const state = {
    "round": 0,
    "players": {

    }
}

export function getState() {
    return state;
}

export function addPlayer({ id, name }) {
    const newPlayer = {
        id,
        name,
        commands: state.round ? Array(state.round).fill("skip") : [],
        diedInRound: null,
    };

    state.players[id] = newPlayer;
    return updateRound();
}

export function removePlayer(id) {
    let alivePlayerCount = Object.values(state.players).filter(p => p.diedInRound === null).length;
    if (alivePlayerCount == 1) {
        Object.keys(state.players).forEach(id => delete state.players[id]);
    } else {
        state.players[id].diedInRound = state.round;
    }
    return updateRound();
}

export function renamePlayer({id, name}) {
    state.players[id].name = name;
    return state;
}

export function applyCommand({id, cmd}) {
    if (!state.players[id]) {
        addPlayer({id, name: "Unknown"});
    }
    state.players[id].commands.push(cmd);
    return updateRound();
}

function updateRound() {
    let live_players = Object.values(state.players).filter(p => p.diedInRound === null);
    state.round = live_players.length ? Math.min(...live_players.map(player => player.commands.length)) : 0;
    return state;
}

export default {
    getState,
    addPlayer,
    removePlayer,
    applyCommand,
    renamePlayer,
}
