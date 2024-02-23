import { useEffect } from 'react';

export function useAPainter() {
    useEffect(() => {
        const apainterUI = document.getElementById('apainter-ui');
        const shareDiv = document.querySelector('#apainter-ui .share');
        const shareUrl: any = document.getElementById('apainter-share-url');
        const progressDiv = document.querySelector('#apainter-ui .progress');
        const progressBar: any = document.querySelector('#apainter-ui .bar');

        const handleUploadCompleted = (event) => {
            shareDiv.classList.remove('hide');
            progressDiv.classList.add('hide');
            shareUrl.value = event.detail.url;
        };

        const handleUploadStarted = (event) => {
            apainterUI.style.display = 'block';
            shareDiv.classList.add('hide');
            progressDiv.classList.remove('hide');
        };

        const handleUploadProgress = (event) => {
            progressBar.style.width = Math.floor(event.detail.progress * 100) + '%';
        };

        document.addEventListener('drawing-upload-completed', handleUploadCompleted);
        document.addEventListener('drawing-upload-started', handleUploadStarted);
        document.addEventListener('drawing-upload-progress', handleUploadProgress);

        // Clipboard functionality (if still needed)
        // const clipboard = new Clipboard('.button.copy');
        // clipboard.on('error', function (e) {
        //   console.error('Error copying to clipboard:', e.action, e.trigger);
        // });

        return () => {
            document.removeEventListener('drawing-upload-completed', handleUploadCompleted);
            document.removeEventListener('drawing-upload-started', handleUploadStarted);
            document.removeEventListener('drawing-upload-progress', handleUploadProgress);

            // Cleanup clipboard if used
            // clipboard.destroy();
        };
    }, []);
};
