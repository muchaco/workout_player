export async function uploadJson(jsonData) {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: 'application/json',
    });

    const formData = new FormData();
    formData.append('file', blob, 'data.json');

    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData,
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
        return result.data.url.replace(
            'https://tmpfiles.org/',
            'https://tmpfiles.org/dl/'
        );
    } else {
        throw new Error('Error during file upload');
    }
}
