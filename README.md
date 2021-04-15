# piopener-pi

### What is it?

Our project, titled piopener, is the infrastructure designed to allow us to communicate with our garage door via our API and perform actions upon it. These actions can be opening, closing, checking history, checking current open status, etc.

#### Repositories of piopener

- [piopener-server](https://github.com/joeylemon/piopener-server): Node.js backend
- [piopener-pi](https://github.com/joeylemon/piopener-pi): Raspberry Pi & Node.js client
- [piopener-app](https://github.com/joeylemon/piopener-app): Swift & storyboards iOS frontend

### Why?

After continuously losing, forgetting, or otherwise destroying our garage door openers, my roommate and I decided it would be a fun idea to reverse-engineer our garage door and allow us to do whatever we wanted with it.

### How?

To set up the endpoint for opening and closing the garage door, we simply connected wires from the Raspberry Pi to the circuit board inside of one of our broken garage door remotes. To determine whether the garage was opened or closed, we placed one magnetic reed switch at the beginning of the garage door frame and another at the end of the frame, with a magnet taped to the door's moving chain. When the moving magnet connects with one of the reed switches, the circuit is closed and we know what state the garage door is in.

![Wiring diagram of piopener-pi](https://github.com/joeylemon/piopener-pi/blob/master/wiring/Wiring%20Diagram.png?raw=true)

### What is piopener-pi?

This repository is the code that lives on the actual Raspberry Pi. It is wired to the reed switches and the door remote, and can therefore send and receive signals programatically via the Pi's GPIO pins.

#### Technologies:
- Node.js and socket.io: this Pi uses Node.js and socket.io to maintain real-time communication with the [piopener-server](https://github.com/joeylemon/piopener-server) for opening and closing the garage and retrieving the status of the door
- Raspberry Pi GPIO: the interface to the GPIO pins on the Pi allows the Node.js server to send signals to the opener circuit board and receive signals from the reed switches.
