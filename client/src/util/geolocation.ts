type Position = {
    lat: number;
    lng: number;
}

export function getCurrentPosition(
    options?: PositionOptions
): Promise<Position> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude: lat, longitude: lng } = position.coords

                resolve({lat, lng})
            },
            error => {
                reject(error)
            }, 
            options
        )
    })
}