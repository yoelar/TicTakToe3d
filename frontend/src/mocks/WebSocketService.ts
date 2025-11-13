// src/mocks/WebSocketService.ts
class MockWebSocketService {
    private callbacks: ((connected: boolean) => void)[] = [];
    private messageCallbacks: ((msg: any) => void)[] = [];

    constructor(_url?: string) {
        // Simulate immediate connection
        setTimeout(() => this.notifyConnectionChange(true), 0);
    }

    connect(_clientId?: string, _gameId?: string) {  // ✅ Fixed parameter order
        this.notifyConnectionChange(true);
    }

    disconnect() {
        this.notifyConnectionChange(false);
    }

    send(_msg: any) {  // ✅ Changed from sendMessage to send
        console.log("Mock WS send:", _msg);
    }

    onConnectionChange(cb: (connected: boolean) => void) {
        this.callbacks.push(cb);
    }

    onMessage(cb: (msg: any) => void) {
        this.messageCallbacks.push(cb);
    }

    // Helper for tests to simulate receiving messages
    simulateMessage(msg: any) {
        this.messageCallbacks.forEach(cb => cb(msg));
    }

    private notifyConnectionChange(connected: boolean) {
        this.callbacks.forEach(cb => cb(connected));
    }
}

// Export both named and default
export { MockWebSocketService as WebSocketService };
export default MockWebSocketService;