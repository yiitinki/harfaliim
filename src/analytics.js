document.addEventListener('deviceready', onDeviceReady, false);
function onDeviceReady () {
    // Creating an extended library configuration.
    var configuration = {
        // Mandatory.
        apiKey: 'bdf5b4c9-e232-4928-8902-c050fadb58e2',
        // Optional.
        locationTracking: true,
        handleFirstActivationAsUpdate: true,
        sessionTimeout: 15
    }
    // Initializing the AppMetrica SDK.
    window.appMetrica.activate(configuration);
    // Sending a custom event.
    //window.appMetrica.reportEvent('Test event', { 'foo': 'bar' });
}