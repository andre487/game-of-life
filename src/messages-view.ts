export class MessagesView {
    public static readonly LIFE_TIME = 10000;

    private readonly _container: HTMLDivElement;

    constructor() {
        this._container = document.createElement('div');
        this._container.className = 'messages-container';
        document.body.appendChild(this._container);
    }

    showMessage(message: string, className?: string) {
        className = className ?? 'info';

        const block = document.createElement('div');
        const closeButton = document.createElement('span');

        block.classList.add('message');
        block.classList.add(className);
        block.innerHTML = message;
        closeButton.className = 'close';
        closeButton.innerHTML = '&times;';

        block.appendChild(closeButton);
        this._container.appendChild(block);

        const closeMessage = () => {
            this._container.removeChild(block);
            closeButton.onclick = null;
        };
        const closeTimeout = setTimeout(closeMessage, MessagesView.LIFE_TIME);

        closeButton.onclick = function() {
            clearTimeout(closeTimeout);
            closeMessage();
            return false;
        };
    }

    showError(message: string) {
        this.showMessage(message, 'error');
    }

    bindToErrors() {
        window.addEventListener('error', (event: ErrorEvent) => {
            if (event.filename.startsWith('chrome')) {
                return;
            }
            this.showError(`An error has occurred: ${event.error}`);
        });

        window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
            this.showError(`An error has occurred: ${event.reason}`);
        });
    }
}
