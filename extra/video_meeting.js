/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
* @flow
*/

import React, { Component } from "react";
import {
StyleSheet,
Text,
TextInput,
View,
Button,
TouchableOpacity,
Platform,
NetInfo,
Alert
} from "react-native";

import {
TwilioVideoLocalView,
TwilioVideoParticipantView,
TwilioVideo
} from "react-native-twilio-video-webrtc";
import { checkPermissions } from "./src/utility/CommonFunctions";

class App extends Component {
state = {
isAudioEnabled: true,
isVideoEnabled: true,
status: "disconnected",
participants: new Map(),
videoTracks: new Map(),
roomName: "Room 1",
token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTS2IzN2UzMjkzMzdhN2RjNWY2NjgwMzQ5NmIxNmQwYTMwLTE2MDU2OTYyMjgiLCJpc3MiOiJTS2IzN2UzMjkzMzdhN2RjNWY2NjgwMzQ5NmIxNmQwYTMwIiwic3ViIjoiQUM1ZTljYjBhZTMyOWJmM2Q3MDRlODdjZDI4MjVkNGZkMSIsImV4cCI6MTYwNTY5OTgyOCwiZ3JhbnRzIjp7ImlkZW50aXR5IjoibWsiLCJ2aWRlbyI6e319fQ.pzPPB3u4b1egh9O3yn_nptQjcjVN9Og4Q0EuLui1bhA",
};

_onConnectButtonPress = async () => {
try {
this.twilioRef.connect({
roomName: this.state.roomName,
accessToken: this.state.token
});
} catch (error) {
console.log(error);
}
this.setState({ status: "connecting" });
};

_onEndButtonPress = () => {
this.twilioRef.disconnect();
};

_onMuteButtonPress = () => {
this.twilioRef
.setLocalAudioEnabled(!this.state.isAudioEnabled)
.then(isEnabled => this.setState({ isAudioEnabled: isEnabled }));
};

_onFlipButtonPress = () => {
this.twilioRef.flipCamera();
};

_onRoomDidConnect = ({ roomName, error }) => {
console.log('onRoomDidConnect: ', roomName);

this.setState({ status: 'connected' });
};

_onRoomDidDisconnect = ({ roomName, error }) => {
console.log("ERROR: ", error);
console.log(roomName)
this.setState({ status: "disconnected" });
};

_onRoomDidFailToConnect = error => {
console.log("ERROR: ", error);

this.setState({ status: "disconnected" });
};

_onParticipantAddedVideoTrack = ({ participant, track }) => {
console.log("onParticipantAddedVideoTrack: ", participant, track);

this.setState({
videoTracks: new Map([
...this.state.videoTracks,
[
track.trackSid,
{ participantSid: participant.sid, videoTrackSid: track.trackSid }
]
])
});
};

_onParticipantRemovedVideoTrack = ({ participant, track }) => {
console.log("onParticipantRemovedVideoTrack: ", participant, track);

const videoTracks = this.state.videoTracks;
videoTracks.delete(track.trackSid);

this.setState({ videoTracks: new Map([...videoTracks]) });
};

setTwilioRef = ref => {
this.twilioRef = ref;
};

render() {
return (
<View style={styles.container}>
{this.state.status === "disconnected" && (
<View>
<Text style={styles.welcome}>React Native Twilio Webrtc</Text>
<TextInput
style={styles.input}
autoCapitalize="none"
value={this.state.roomName}
onChangeText={text => this.setState({ roomName: text })}
></TextInput>
<TextInput
style={styles.input}
autoCapitalize="none"
value={this.state.token}
onChangeText={text => this.setState({ token: text })}
></TextInput>
<Button
title="Connect"
onPress={this._onConnectButtonPress}
style={styles.button}
></Button>

</View>
)}

{this.state.status === "connected" ||
this.state.status === "connecting" ? (
<View style={styles.callContainer}>
{this.state.status === "connected" && (
<View style={styles.remoteGrid}>
{Array.from(
this.state.videoTracks,
([trackSid, trackIdentifier]) => {
return (
<TwilioVideoParticipantView
style={styles.remoteVideo}
key={trackSid}
trackIdentifier={trackIdentifier}
/>
);
}
)}
</View>
)}
<View style={styles.optionsContainer}>
<TouchableOpacity
style={styles.optionButton}
onPress={this._onEndButtonPress}
>
<Text style={{ fontSize: 12 }}>End</Text>
</TouchableOpacity>
<TouchableOpacity
style={styles.optionButton}
onPress={this._onMuteButtonPress}
>
<Text style={{ fontSize: 12 }}>
{this.state.isAudioEnabled ? "Mute" : "Unmute"}
</Text>
</TouchableOpacity>
<TouchableOpacity
style={styles.optionButton}
onPress={this._onFlipButtonPress}
>
<Text style={{ fontSize: 12 }}>Flip</Text>
</TouchableOpacity>
<TwilioVideoLocalView enabled={true} style={styles.localVideo} />
<View />
</View>
</View>
) : null}

<TwilioVideo
ref={this.setTwilioRef}
onRoomDidConnect={this._onRoomDidConnect}
onRoomDidDisconnect={this._onRoomDidDisconnect}
onRoomDidFailToConnect={this._onRoomDidFailToConnect}
onParticipantAddedVideoTrack={this._onParticipantAddedVideoTrack}
onParticipantRemovedVideoTrack={this._onParticipantRemovedVideoTrack}
/>
</View>
);
}
};

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: "white"
},
callContainer: {
flex: 1,
position: "absolute",
bottom: 0,
top: 0,
left: 0,
right: 0
},
welcome: {
fontSize: 30,
textAlign: "center",
paddingTop: 40
},
input: {
height: 50,
borderWidth: 1,
marginRight: 70,
marginLeft: 70,
marginTop: 50,
textAlign: "center",
backgroundColor: "white"
},
button: {
marginTop: 100
},
localVideo: {
flex: 1,
width: 125,
height: 200,
position: "absolute",
right: 10,
bottom: 400,
borderRadius: 2,
borderColor: '#4e4e4e'
},
remoteGrid: {
flex: 1,
flexDirection: "row",
flexWrap: "wrap"
},
remoteVideo: {
width: 200,
height: 150
},
optionsContainer: {
position: "absolute",
left: 0,
bottom: 0,
right: 0,
height: 100,
// backgroundColor: "blue",
flexDirection: "row",
alignItems: "center",
justifyContent: 'center'
},
optionButton: {
width: 60,
height: 60,
marginLeft: 10,
marginRight: 10,
borderRadius: 100 / 2,
backgroundColor: "grey",
justifyContent: "center",
alignItems: "center"
}
});

export default App;