/**
 * Finite State Machine
 * A generic, reusable FSM implementation
 */
class FiniteStateMachine {
    constructor() {
        this.states = new Map();
        this.currentState = null;
        this.context = {};
        this.transitionHistory = [];
        this.onStateChange = null;
        this.debug = false;
    }

    /**
     * Define a state with optional lifecycle hooks and event handlers
     * @param {string} name - The state name
     * @param {Object} handlers - Entry/exit hooks and event handlers
     * @returns {FiniteStateMachine} - For method chaining
     */
    addState(name, handlers = {}) {
        this.states.set(name, {
            name,
            entry: handlers.entry || (() => { }),
            exit: handlers.exit || (() => { }),
            onMouseDown: handlers.onMouseDown || null,
            onMouseMove: handlers.onMouseMove || null,
            onMouseUp: handlers.onMouseUp || null,
            onKeyDown: handlers.onKeyDown || null,
            onKeyUp: handlers.onKeyUp || null,
        });
        return this;
    }

    /**
     * Transition to a new state
     * @param {string} newState - Target state name
     * @param {Object} [eventData] - Optional data passed with the transition
     */
    transition(newState, eventData = {}) {
        if (!this.states.has(newState)) {
            throw new Error(`Unknown state: "${newState}"`);
        }

        const oldState = this.currentState;
        const oldStateDef = oldState ? this.states.get(oldState) : null;

        // Call exit handler on old state
        if (oldStateDef) {
            oldStateDef.exit(this.context, eventData);
        }

        // Update state
        const newStateDef = this.states.get(newState);
        this.currentState = newState;

        // Record transition
        this.transitionHistory.push({
            from: oldState,
            to: newState,
            event: eventData,
            timestamp: Date.now()
        });

        if (this.debug) {
            console.log(`FSM: ${oldState || 'none'} → ${newState}`, eventData);
        }

        // Call entry handler on new state
        newStateDef.entry(this.context, eventData);

        // Notify external listener
        if (this.onStateChange) {
            this.onStateChange(newState, oldState, eventData);
        }

        return this;
    }

    /**
     * Initialize the FSM with a starting state
     * @param {string} initialState 
     * @param {Object} [context] - Shared context object
     */
    start(initialState, context = {}) {
        this.context = context;
        return this.transition(initialState, { type: 'INIT' });
    }

    /**
     * Dispatch an event to the current state
     * @param {string} eventType - The handler name (e.g., 'onMouseDown')
     * @param {...any} args - Arguments to pass to the handler
     */
    handleEvent(eventType, ...args) {
        if (!this.currentState) {
            if (this.debug) console.warn('FSM: No current state to handle event:', eventType);
            return;
        }

        const stateDef = this.states.get(this.currentState);
        const handler = stateDef[eventType];

        if (handler) {
            handler(this.context, ...args);
        } else if (this.debug) {
            console.log(`FSM: No handler for "${eventType}" in state "${this.currentState}"`);
        }
    }

    /**
     * Check if currently in a specific state
     * @param {string} stateName 
     * @returns {boolean}
     */
    isInState(stateName) {
        return this.currentState === stateName;
    }

    /**
     * Check if a transition is allowed
     * @param {string} stateName 
     * @returns {boolean}
     */
    canTransitionTo(stateName) {
        return this.states.has(stateName);
    }

    /**
     * Get current state name
     * @returns {string|null}
     */
    getState() {
        return this.currentState;
    }

    /**
     * Get transition history (useful for debugging)
     * @param {number} [limit] - Max number of entries to return
     * @returns {Array}
     */
    getHistory(limit) {
        if (limit) {
            return this.transitionHistory.slice(-limit);
        }
        return [...this.transitionHistory];
    }
}