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
        commands: state.round ? Array(state.round).fill("skip") : []
    };

    state.players[id] = newPlayer;
    return updateRound();
}

export function removePlayer(id) {
    delete state.players[id];
    return updateRound();
}

export function applyCommand({id, cmd}) {
    if (!state.players[id]) {
        addPlayer({id, name: "Unknown"});
    }
    state.players[id].commands.push(cmd);
    return updateRound();
}

export function updateRound() {
    let round = Math.min(...Object.values(state.players).map(player => player.commands.length));
    state.round = round;
    return state;
}

export default {
    getState,
    addPlayer,
    removePlayer,
    applyCommand
}
