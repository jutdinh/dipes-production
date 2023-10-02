module.exports = ( socket ) => {
    socket.on("new-connected", (payload) => {
        console.log(payload)
    })

    socket.emit("/dipe-production-user-login", (payload) => {
        
    })
    console.log("Connected")
}
