import React, { Component, useRef, useState } from 'react';
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
  
} from 'react-native';
import {
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
  TwilioVideo
} from 'react-native-twilio-video-webrtc';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Octicons from 'react-native-vector-icons/Octicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const deviceWidth = Dimensions.get('window').width
const deviceHeight = Dimensions.get('window').height
const Example = (props) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [status, setStatus] = useState('disconnected');
  const [participants, setParticipants] = useState(new Map());
  const [videoTracks, setVideoTracks] = useState(new Map());
  const [token, setToken] = useState('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzhmYTc2YTk4MWMzNzU5NjYyOWZmMTk5Mjk4NGNlZmNiLTE2MDU4NTYxOTQiLCJpc3MiOiJTSzhmYTc2YTk4MWMzNzU5NjYyOWZmMTk5Mjk4NGNlZmNiIiwic3ViIjoiQUM0OWY0NTc1ZmQ5ZjBjNTNkYmJjYTE2YzdjZmVhNzU2YyIsImV4cCI6MTYwNTg1OTc5NCwiZ3JhbnRzIjp7ImlkZW50aXR5Ijoic2h1YmhhbTMiLCJ2aWRlbyI6eyJyb29tIjoicm9vbTIwXzAxIn19fQ.CNP2XLVOaXRoDarot2Otk3pW4VNM2wuob-1J03p8d3k')
  const [emulator, setEmulator]=useState('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzhmYTc2YTk4MWMzNzU5NjYyOWZmMTk5Mjk4NGNlZmNiLTE2MDU5NTI0NTUiLCJpc3MiOiJTSzhmYTc2YTk4MWMzNzU5NjYyOWZmMTk5Mjk4NGNlZmNiIiwic3ViIjoiQUM0OWY0NTc1ZmQ5ZjBjNTNkYmJjYTE2YzdjZmVhNzU2YyIsImV4cCI6MTYwNTk1NjA1NSwiZ3JhbnRzIjp7ImlkZW50aXR5Ijoic2h1YmhhbTUiLCJ2aWRlbyI6eyJyb29tIjoicm9vbTIxXzAxIn19fQ.2uSC8lcd9rHuLed1xfHCeNKymh78KwcDGRZSRjNzDK4')
  const twilioRef = useRef(null);
  const [choosenParticipant, setChoosenParticipant] = 
  useState(
    <TwilioVideoLocalView
    enabled={true}
    style={{height:'100%', width:deviceWidth}}
    />)

  const _onConnectButtonPress = () => {
    twilioRef.current.connect({ accessToken: token });
    setStatus('connecting');
  }

  const onConnectButtonPress = () => {
    twilioRef.current.connect({ accessToken: emulator });
    setStatus('connecting');
  }
  
  const _onEndButtonPress = () => {
    twilioRef.current.disconnect();
  };

  const _onMuteButtonPress = () => {
    twilioRef.current
      .setLocalAudioEnabled(!isAudioEnabled)
      .then(isEnabled => setIsAudioEnabled(isEnabled));
  };

  const _onVideoDisabledButtonPress = () => {
    twilioRef.current
      .setLocalVideoEnabled(!isVideoEnabled)
      .then(isEnabled => setIsVideoEnabled(isEnabled));
  };

  const _onFlipButtonPress = () => {
    twilioRef.current.flipCamera();
  };

  const _onRoomDidConnect = ({roomName, error}) => {
    console.log('onRoomDidConnect: ', roomName);

    setStatus('connected');
  };

  const _onRoomDidDisconnect = ({ roomName, error }) => {
    console.log('[Disconnect]ERROR: ', error);

    setStatus('disconnected');
  };

  const _onRoomDidFailToConnect = error => {
    console.log('[FailToConnect]ERROR: ', error);

    setStatus('disconnected');
  };

  const _onParticipantAddedVideoTrack = ({ participant, track }) => {
    console.log('onParticipantAddedVideoTrack: ', participant, track);

    setVideoTracks(
      new Map([
        ...videoTracks,
        [
          track.trackSid,
          { participantSid: participant.sid, videoTrackSid: track.trackSid, identity:participant.identity },
        ],
      ]),
    );
  };

  const _onParticipantRemovedVideoTrack = ({ participant, track }) => {
    console.log('onParticipantRemovedVideoTrack: ', participant, track);

    const videoTracksLocal = videoTracks;
    videoTracksLocal.delete(track.trackSid);
    setVideoTracks(videoTracksLocal);
  };

  const _chooseParticipant = (trackSid, trackIdentifier)=>{
    console.log('trackSid'+trackSid)
    console.log(trackIdentifier)
    if(trackSid=='LocalView')
    {
    setChoosenParticipant(
    <TwilioVideoLocalView
      enabled={true}
      style={{height:'100%', width:deviceWidth}}
    />
    );
    console.log('local view')
    }
    else
    {
    setChoosenParticipant(
    <TwilioVideoParticipantView
      style={{height:'100%', width:deviceWidth}}
      key={trackSid}
      trackIdentifier={trackIdentifier}
    />
    );
    {console.log('remote view')}
    }
  }

  return (
    <View style={{flex:1}}>
      {
        status === 'disconnected' &&
        <View>
          <Text style={{fontSize:34}}>
            React Native Twilio Video
          </Text>

          <FontAwesome name="rocket"
          size={25}
          color="#f51637" />  
          <Octicons name="mute" size={25}
          color="#f51637"/>
          <TextInput
            style={{height:34, width:'100%'}}
            autoCapitalize='none'
            value={token}
            onChangeText={(text) => setToken(text)}>
          </TextInput>
          <Button
            title="Connect"
            onPress={_onConnectButtonPress}>
          </Button>
          <Button
          title="Emulator"
          onPress={onConnectButtonPress}>
        </Button>
        <Button
          title="test"
          onPress={()=>{console.log('test')}}>
        </Button>
        </View>
      }

      <View style={{flex:1}}>
      {
        (status === 'connected' || status === 'connecting')&&
        <View style={{flex:1}}>
          <View style={{flex:1}}>   
          <View style={{flex:8}}>
          {choosenParticipant}       
          </View> 
            <View style={styles.meetingControlButtonView}>
            <Octicons.Button
              name={ isAudioEnabled ? "unmute" : "mute" }
              color="red"
              backgroundColor="white"
              size={30}
              onPress={_onMuteButtonPress}/>           
            <MaterialIcons.Button
              name="call-end"
              color="red"
              backgroundColor="white"
              size={30}
              onPress={_onEndButtonPress}/>
            <MaterialIcons.Button
              name={ isVideoEnabled ? "videocam" : "videocam-off" }
              color="red"
              backgroundColor="white"
              size={30}                         
              onPress={_onVideoDisabledButtonPress}/>
            <MaterialIcons.Button
              name="flip-camera-android"
              color="red"
              backgroundColor="white"
              size={30}
              onPress={_onFlipButtonPress}/>
            </View>
          </View>      

          <View style={{flex:1}}>
          {
            status === 'connected' &&
            <View style={{flex:1, marginTop:5}}>
           
            <ScrollView>
            <TouchableOpacity onPress={()=>{_chooseParticipant('LocalView')}}>
            <View style={{flex:1,flexDirection:'row'}}>
            <View style={{flex:2,alignItems:'center'}}>
            <TwilioVideoLocalView
              enabled={true}
              style={{height:deviceHeight/8, width:deviceWidth/3}}
            /> 
            </View>
            <View style={{flex:3}}>
            <Text style={{color:'white'}}>You</Text>
            </View>
            </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>{_chooseParticipant('LocalView')}}>
            <View style={{flex:1,flexDirection:'row'}}>
            <View style={{flex:2,alignItems:'center'}}>
            <TwilioVideoLocalView
              enabled={true}
              style={{height:deviceHeight/8, width:deviceWidth/3}}
            /> 
            </View>
            <View style={{flex:3}}>
            <Text>You</Text>
            </View>
            </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>{_chooseParticipant('LocalView')}}>
            <View style={{flex:1,flexDirection:'row'}}>
            <View style={{flex:2,alignItems:'center'}}>
            <TwilioVideoLocalView
              enabled={true}
              style={{height:deviceHeight/8, width:deviceWidth/3}}
            /> 
            </View>
            <View style={{flex:3}}>
            <Text>You</Text>
            </View>
            </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>{_chooseParticipant('LocalView')}}>
            <View style={{flex:1,flexDirection:'row'}}>
            <View style={{flex:2,alignItems:'center'}}>
            <TwilioVideoLocalView
              enabled={true}
              style={{height:deviceHeight/8, width:deviceWidth/3}}
            /> 
            </View>
            <View style={{flex:3}}>
            <Text>You</Text>
            </View>
            </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>{_chooseParticipant('LocalView')}}>
            <View style={{flex:1,flexDirection:'row'}}>
            <View style={{flex:2,alignItems:'center'}}>
            <TwilioVideoLocalView
              enabled={true}
              style={{height:deviceHeight/8, width:deviceWidth/3}}
            /> 
            </View>
            <View style={{flex:3}}>
            <Text>You</Text>
            </View>
            </View>
            </TouchableOpacity>
            
            {
              Array.from(videoTracks, ([trackSid, trackIdentifier]) =>
              {
                return (
                  <TouchableOpacity 
                  onPress={()=>{
                  console.log(trackIdentifier)||
                  _chooseParticipant(trackSid,trackIdentifier)
                  }}
                  key={trackSid}>
                  <View style={{flexDirection:'row', flex:1}}>
                  <View style={{flex:2,alignItems:'center'}}>
                  <TwilioVideoParticipantView
                    style={{height:deviceHeight/8,
                    width:deviceWidth/3,
                    flexDirection:'column', marginTop:5,
                    }}
                    key={trackSid}   
                    keyExtractor={trackSid}     
                    trackIdentifier={trackIdentifier}       
                  />
                  </View>
                  <View style={{flex:3}}>
                  <Text key={trackSid}>{trackIdentifier.identity}</Text>
                  </View>
                  </View>
                  </TouchableOpacity>                             
                )         
              })
            }   
            </ScrollView>            
            </View>
          }       
          </View>
        </View>        
      }
      </View>

      <TwilioVideo
        ref={ twilioRef }
        onRoomDidConnect={ _onRoomDidConnect }
        onRoomDidDisconnect={ _onRoomDidDisconnect }
        onRoomDidFailToConnect= { _onRoomDidFailToConnect }
        onParticipantAddedVideoTrack={ _onParticipantAddedVideoTrack }
        onParticipantRemovedVideoTrack= { _onParticipantRemovedVideoTrack }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  meetingControlButtonView:{
    flex:1,
    flexDirection:'row',
    justifyContent:'space-around', 
    marginTop:5,   
    alignItems:'center'
  },
  meetingControlButton:{
    height:'100%',
    width:deviceWidth/6,
    borderRadius:deviceWidth/12,
    backgroundColor:'red',
    alignItems:'center',
    justifyContent:'center'
  }
});

export default Example;