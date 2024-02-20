import { useEffect } from 'react';

type FileReaderEventTarget = EventTarget & {
    result: string;
}

type FileReaderEvent = ProgressEvent<FileReader> & {
    target: FileReaderEventTarget;
}

export const useDragAndDrop = () => {
    useEffect(() => {
        const dropArea = document.body;

        const handleDragOver = (event: DragEvent) => {
            event.stopPropagation();
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'copy';
            }
        };

        const handleDrop = (event: DragEvent) => {
            event.stopPropagation();
            event.preventDefault();

            if (!event.dataTransfer) return;

            const files = event.dataTransfer.files;
            Array.from(files).forEach(file => {
                // Handle file processing here
                // Example: Process .json files
                if (file.name.endsWith('.json')) {
                    const reader = new FileReader();
                    reader.onload = (event: FileReaderEvent) => {
                        // Process JSON file
                        // Example: document.querySelector('a-scene').systems.brush.loadJSON(JSON.parse(event.target.result));
                    };
                    reader.readAsText(file);
                }

                // Handle other file types similarly...
            });
        };

        dropArea.addEventListener('dragover', handleDragOver, false);
        dropArea.addEventListener('drop', handleDrop, false);

        return () => {
            dropArea.removeEventListener('dragover', handleDragOver);
            dropArea.removeEventListener('drop', handleDrop);
        };
    }, []);
};
