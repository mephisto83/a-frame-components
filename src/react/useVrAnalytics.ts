import { useEffect } from 'react';

export const useVrAnalytics = () => {
    useEffect(() => {
        let emitted = false;

        const handleEnterVr = async () => {
            // Replace this with your VR device check and mobile device check logic
            let device = await detectDevice();
            const isVrHeadsetConnected = device === 'VR'; // AFRAME.utils.device.checkHeadsetConnected();
            const isMobileDevice = device === 'Phone'; // AFRAME.utils.device.isMobile();

            if (emitted || !isVrHeadsetConnected || isMobileDevice) {
                return;
            }

            // Replace this with your analytics logic
            console.log('Sending VR Analytics: Enter VR');
            // ga('send', 'event', 'General', 'entervr');
            emitted = true;
        };

        // Assuming 'el' is the element you want to attach the listener to
        const el = document.querySelector('a-scene'); // or any other selector
        el?.addEventListener('enter-vr', handleEnterVr);

        return () => {
            el?.removeEventListener('enter-vr', handleEnterVr);
        };
    }, []);
};

export const DeviceTypes = {
    VR: 'VR',
    Phone: 'Phone',
    OtherDevice: 'Other device'
}

export async function detectDevice() {
    return new Promise((resolve, reject) => {
        // Check for VR headset
        if ((navigator as any).getVRDisplays) {
            (navigator as any).getVRDisplays().then((displays) => {
                if (displays.length > 0) {
                    resolve("VR");
                } else {
                    resolve(checkIfPhone());
                }
            });
        } else if ((navigator as any).xr) {
            // For newer WebXR API
            (navigator as any).xr.isSessionSupported('immersive-vr').then((supported) => {
                if (supported) {
                    resolve("VR");
                } else {
                    resolve(checkIfPhone());
                }
            });
        } else {
            // Fallback if WebVR/WebXR not supported
            resolve(checkIfPhone());
        }
    });

    // Check for phone
    function checkIfPhone() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/mobile|android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)) {
            return "Phone";
        } else {
            return "Other device";
        }
    }
}