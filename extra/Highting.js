import React, { Component } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableHighlight,
  TouchableWithoutFeedback
} from "react-native";
import {
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
  TwilioVideo
} from "react-native-twilio-video-webrtc";
import Octicons from 'react-native-vector-icons/Octicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const deviceWidth = Dimensions.get('window').width
const deviceHeight = Dimensions.get('window').height

class App extends Component {
  state = {
    isAudioEnabled: true,
    isVideoEnabled: true,
    status: "disconnected",
    choosenParticipant: (
      <TwilioVideoLocalView
        enabled={true}
        style={{ height: '80%', width: deviceWidth }}
      />
    ),
    participants: new Map(),
    videoTracks: new Map(),
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzI3ZmE2YjBhZTYyNDIxNGFhOTViYjE1OWZlYjJiY2RlLTE2MDYzMjAzNDYiLCJpc3MiOiJTSzI3ZmE2YjBhZTYyNDIxNGFhOTViYjE1OWZlYjJiY2RlIiwic3ViIjoiQUNkYmIwZmQ5YzA3ZDRlMzNhOThiOTNkOTU2OTM5Y2Y1MiIsImV4cCI6MTYwNjMyMzk0NiwiZ3JhbnRzIjp7ImlkZW50aXR5Ijoic2h1YmhhbTUiLCJ2aWRlbyI6eyJyb29tIjoicm9vbTI1XzA0In19fQ.yfQQOaSS_AZybP51as0aE54SIbTejZd5rNWV1oADQhQ'
  };

  _onConnectButtonPress = () => {
    try {
      this.twilioRef.connect({
        accessToken: this.state.token,
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

  _onVideoDisabledButtonPress = () => {
    this.twilioRef
      .setLocalVideoEnabled(!this.state.isVideoEnabled)
      .then(isEnabled => this.setState({ isVideoEnabled: isEnabled }));
  };

  _onFlipButtonPress = () => {
    this.twilioRef.flipCamera();
  };

  _onRoomDidConnect = () => {
    this.setState({ status: "connected" });
    console.log('connected')
  };

  _onRoomDidDisconnect = ({ roomName, error }) => {
    console.log("ERROR: ", error);
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
          {
            participantSid: participant.sid,
            videoTrackSid: track.trackSid,
            identity: participant.identity
          }
        ]
      ])
    });
  };

  _chooseParticipant = (trackSid_Or_localView, trackIdentifier) => {
    if (trackSid_Or_localView == 'LocalView') {
      this.setState({
        choosenParticipant:
          <TwilioVideoLocalView enabled={true} style={{ height: '80%', width: deviceWidth }} />
      });
      console.log('local view')
    }
    else {
      this.setState({
        choosenParticipant:
          <TwilioVideoParticipantView
            key={trackSid_Or_localView}
            trackIdentifier={trackIdentifier}
            style={{ height: '80%', width: deviceWidth }}
          />
      });
      { console.log('remote view') }
    }
  }

  _onParticipantRemovedVideoTrack = ({ participant, track }) => {
    console.log("onParticipantRemovedVideoTrack: ", participant, track);

    const videoTracks = this.state.videoTracks;
    videoTracks.delete(track.trackSid);
    this.setState({ videoTracks: new Map([...videoTracks]) });
  };

  setTwilioRef = ref => {
    this.twilioRef = ref;
  };

  rednerControls = () => {
    return (
      <View style={styles.meetingControlButtonView}>

        <View style={styles.meetingControlButton}>
          <TouchableWithoutFeedback onPress={this._onMuteButtonPress}>
            <Octicons
              name={this.state.isAudioEnabled ? "unmute" : "mute"}
              color="white"
              size={25}
            />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.meetingControlButton}>
          <TouchableWithoutFeedback onPress={this._onEndButtonPress}>
            <MaterialIcons
              name="call-end"
              color="white"
              size={25}
            />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.meetingControlButton}>
          <TouchableWithoutFeedback onPress={this._onVideoDisabledButtonPress}>
            <MaterialIcons
              name={this.state.isVideoEnabled ? "videocam" : "videocam-off"}
              color="white"
              size={25}
            />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.meetingControlButton}>
          <TouchableWithoutFeedback onPress={this._onFlipButtonPress}>
            <MaterialIcons
              name="flip-camera-android"
              color="white"
              size={25}
            />
          </TouchableWithoutFeedback>
        </View>
      </View>
    )
  }

  render() {
    return (
      <View>
        {
          (this.state.status === 'disconnected') &&
          <View style={{ height: deviceHeight / 2 }}>
            <Text style={{ fontSize: 34 }}>
              React Native Twilio Video
            </Text>
            <TextInput
              style={{ height: 34, width: '100%' }}
              autoCapitalize='none'
              value={this.state.token}
              onChangeText={text => this.setState({ token: text })} />
            <Button
              title="Connect"
              onPress={this._onConnectButtonPress} />
            <Button
              title="test"
              onPress={() => { console.log('test') }} />
          </View>
        }

        {
          (this.state.status === 'connected' || this.state.status === 'connecting') &&
          <View style={{ top: 0, height: deviceHeight / 2 , zIndex:2}}>
            {this.state.choosenParticipant}
            {this.rednerControls()}
          </View>
        }
        {
          (this.state.status === 'connected' || this.state.status === 'connecting') &&
          <ScrollView style={{ top: 5, height: deviceHeight / 3 ,zIndex:1 }}>
            <TouchableOpacity onPress={() => { this._chooseParticipant('LocalView') }}>
              <View style={{ flexDirection: 'row', backgroundColor: 'red' }}>
                <TwilioVideoLocalView
                  enabled={true}
                  style={{ height: 150, width: deviceWidth / 3 }}
                />
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 23 }}>You</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { this._chooseParticipant('LocalView') }}>
              <View style={{ flexDirection: 'row', backgroundColor: 'red' }}>
                <TwilioVideoLocalView
                  enabled={true}
                  style={{ height: 150, width: deviceWidth / 3 }}
                />
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 23 }}>You</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { this._chooseParticipant('LocalView') }}>
              <View style={{ flexDirection: 'row', backgroundColor: 'red' }}>
                <TwilioVideoLocalView
                  enabled={true}
                  style={{ height: 150, width: deviceWidth / 3 }}
                />
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 23 }}>You</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { this._chooseParticipant('LocalView') }}>
              <View style={{ flexDirection: 'row', backgroundColor: 'red' }}>
                <TwilioVideoLocalView
                  enabled={true}
                  style={{ height: deviceHeight, width: deviceWidth / 3 }}
                />
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 23 }}>You</Text>
                </View>
              </View>
            </TouchableOpacity>

            {
              this.state.status === 'connected' &&
              Array.from(this.state.videoTracks, ([trackSid, trackIdentifier]) => {
                return (
                  <TouchableOpacity key={trackSid}
                    onPress={() => { this._chooseParticipant(trackSid, trackIdentifier) }}>
                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                      <TwilioVideoParticipantView
                        style={{ height: 150, width: deviceWidth / 3 }}
                        key={trackSid}
                        keyExtractor={trackSid}
                        trackIdentifier={trackIdentifier}
                      />
                      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Text key={trackSid} style={{ fontSize: 23 }}>{trackIdentifier.identity}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })
            }
          </ScrollView>
        }

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
  meetingControlButtonView: {
    height: '20%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    overflow: 'hidden',
  },
  twilioVideoParticipantView: {
    height: deviceHeight,
    width: deviceWidth / 3,
    flexDirection: 'column',
    marginTop: 5,
    elevation: 1
  },
  meetingControlButton: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default App;