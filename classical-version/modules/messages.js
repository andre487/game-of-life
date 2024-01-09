define(function () {
    'use strict';
    var lifeTime = 10000;

    var container = document.createElement('div');
    container.className = 'messages-container';
    document.body.appendChild(container);

    var showMessage = function (message, className) {
        className = className || 'info';

        var block = document.createElement('div'),
            closeButton = document.createElement('span');

        block.classList.add('message');
        block.classList.add(className);
        block.innerHTML = message;
        closeButton.className = 'close';
        closeButton.innerHTML = '&times;';

        block.appendChild(closeButton);
        container.appendChild(block);

        var closeMessage = function () {
                container.removeChild(block);
            },
            closeTimeout = setTimeout(closeMessage, lifeTime);

        closeButton.onclick = function () {
            clearTimeout(closeTimeout);
            closeMessage();
            return false;
        };
    };

    var showError = function (message) {
        showMessage(message, 'error');
    };

    return {
        showMessage: showMessage,
        showError: showError
    }
});
