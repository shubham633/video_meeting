import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
  TwilioVideo,
} from 'react-native-twilio-video-webrtc';
import Octicons from 'react-native-vector-icons/Octicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

class App extends Component {
  state = {
    isAudioEnabled: true,
    isVideoEnabled: true,
    status: 'disconnected',
    choosenParticipant: (
      <TwilioVideoLocalView enabled={true} style={styles.upperContainerVideo} />
    ),
    participants: new Map(),
    videoTracks: new Map(),
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzllMTY3MzExYWM3ZTM2MGQ1OGJjMDhkMTg1OTI2YzA0LTE2MDYzNzQ4NTkiLCJpc3MiOiJTSzllMTY3MzExYWM3ZTM2MGQ1OGJjMDhkMTg1OTI2YzA0Iiwic3ViIjoiQUMxNDZiOGE1YTZjNWFkYTdjNjU3OTJjZmU3NWQwYWVjNCIsImV4cCI6MTYwNjM3ODQ1OSwiZ3JhbnRzIjp7ImlkZW50aXR5IjoibW1ta2trampqIiwidmlkZW8iOnt9fX0.tOeJPhzBJbfN8Or_Qf3M-ovRqFCRItMbhJyfoIoBa6A'
  };

  _onConnectButtonPress = () => {
    try {
      this.twilioRef.connect({
        accessToken: this.state.token,
        roomName: 'Room 1',
      });
    } catch (error) {
      console.log(error);
    }
    this.setState({ status: 'connecting' });
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
            identity: participant.identity,
          },
        ],
      ]),
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

  _chooseParticipant = (trackSid_or_localView, trackIdentifier) => {
    if (trackSid_or_localView === 'LocalView') {
      this.setState({
        choosenParticipant:
          <TwilioVideoLocalView enabled={true} style={styles.upperContainerVideo} />
      });
      console.log('local view')
    }
    else {
      this.setState({
        choosenParticipant:
          <TwilioVideoParticipantView
            key={trackSid_or_localView}
            trackIdentifier={trackIdentifier}
            style={styles.upperContainerVideo}
          />
      });
      { console.log('remote view') }
    }
  }

  _rednerControls = () => {
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

  _scrollableLocalVideo = () => {
    return (
      <TouchableOpacity onPress={() => { this._chooseParticipant('LocalView') }}>
        <View style={styles.scrollableLocalContainer}>
          <View style={styles.scrollableTextContainer}>
            <Text style={styles.scrollableText}>You</Text>
          </View>
          <TwilioVideoLocalView
            enabled={true}
            style={styles.scrollableLocalVideo}
          />
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <View>
        {
          this.state.status === 'disconnected' &&
          <View>
            <Text style={styles.disconnectedText}>
              React Native Twilio Video
            </Text>
            <TextInput
              style={styles.disconnectedTextInput}
              autoCapitalize="none"
              value={this.state.token}
              onChangeText={(text) => this.setState({ token: text })} />
            <Button title="Connect" onPress={this._onConnectButtonPress} />
          </View>
        }

        {
          (this.state.status === 'connected' || this.state.status === 'connecting') &&
          <View>
            {this.state.choosenParticipant}
            {this._rednerControls()}

            <ScrollView horizontal={true} style={styles.mainScrollContainer}>
              {this._scrollableLocalVideo()}

              {
                this.state.status === 'connected' &&
                Array.from(this.state.videoTracks, ([trackSid, trackIdentifier]) => {
                  return (
                    <TouchableOpacity key={trackSid}
                      onPress={() => { this._chooseParticipant(trackSid, trackIdentifier) }}>
                      <View style={styles.scrollableRemoteContainer}>
                        <View style={styles.scrollableTextContainer}>
                          <Text key={trackSid} style={styles.scrollableText}>{trackIdentifier.identity}</Text>
                        </View>
                        <TwilioVideoParticipantView
                          style={styles.scrollableRemoteVideo}
                          key={trackSid}
                          keyExtractor={trackSid}
                          trackIdentifier={trackIdentifier}
                        />
                      </View>
                    </TouchableOpacity>
                  )
                })
              }
            </ScrollView>
          </View>
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
}

const styles = StyleSheet.create({
  disconnectedText: {
    fontSize: 34,
  },
  disconnectedTextInput: {
    height: 34,
    width: '100%',
  },
  upperContainerVideo: {
    height: '50%',
    width: deviceWidth,
  },
  meetingControlButtonView: {
    height: '10%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  meetingControlButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainScrollContainer: {
    height: '40%',
  },
  scrollableLocalContainer: {
    width: deviceWidth / 3,
  },
  scrollableLocalVideo: {
    height: '70%',
    width: deviceWidth / 3,
  },
  scrollableRemoteContainer: {
    marginLeft: 2,
    width: deviceWidth / 3,
  },
  scrollableRemoteVideo: {
    height: '70%',
    width: deviceWidth / 3,
  },
  scrollableTextContainer: {
    alignItems: 'center',
    height: '30%',
    justifyContent: 'flex-end',
  },
  scrollableText: {
    fontSize: 18,
  },
});

export default App;
