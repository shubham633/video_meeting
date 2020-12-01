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
    choosenParticipant:(
      <TwilioVideoLocalView 
        enabled={true}
        style={{height:'80%', width:deviceWidth}}
      />
    ),
    participants: new Map(),
    videoTracks: new Map(),
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzhmYTc2YTk4MWMzNzU5NjYyOWZmMTk5Mjk4NGNlZmNiLTE2MDYxMjU0NzQiLCJpc3MiOiJTSzhmYTc2YTk4MWMzNzU5NjYyOWZmMTk5Mjk4NGNlZmNiIiwic3ViIjoiQUM0OWY0NTc1ZmQ5ZjBjNTNkYmJjYTE2YzdjZmVhNzU2YyIsImV4cCI6MTYwNjEyOTA3NCwiZ3JhbnRzIjp7ImlkZW50aXR5Ijoic2h1YmhhbTIiLCJ2aWRlbyI6eyJyb29tIjoicm9vbTIzXzAxIn19fQ.LcUuNYpAnMn1NjiaatxpXQinzwz3n8ZePEzFqJ4ROII'
    };

  _onConnectButtonPress = () => {
    try {
      this.twilioRef.connect({
        accessToken: this.state.token,
        roomName:'room23_01'
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
    console.log('RoomName')
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
          { participantSid: participant.sid, 
            videoTrackSid: track.trackSid,
            identity:participant.identity }
        ]
      ])
    });
  };

  _chooseParticipant = (trackSid, trackIdentifier)=>{
    console.log('trackSid'+trackSid)
    console.log(trackIdentifier)
    if(trackSid=='LocalView')
    {
    this.setState({
      choosenParticipant:
      <TwilioVideoLocalView
        enabled={true}
        style={{height:'100%', width:deviceWidth}}
      />
    });
    console.log('local view')
    }
    else
    {
    this.setState({
      choosenParticipant:
      <TwilioVideoParticipantView
        style={{height:'100%', width:deviceWidth}}
        key={trackSid}
        trackIdentifier={trackIdentifier}
      />
    });
    {console.log('remote view')}
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

  render() {
   return(
       <View style={{flex:1}}>

       {
        this.state.status === 'disconnected' &&
        <View>
          <Text style={{fontSize:34}}>
            React Native Twilio Video
          </Text>              
          <TextInput
            style={{height:34, width:'100%'}}
            autoCapitalize='none'
            value={this.state.token}
            onChangeText={text => this.setState({ token: text })}>
          </TextInput>
          <Button
            title="Connect"
            onPress={this._onConnectButtonPress}>
          </Button>           
          <Button
            title="test"
            onPress={()=>{console.log('test')}}>
          </Button>
        </View>
      }

      {
        (this.state.status === 'connecting'|| this.state.status === 'connected' ) &&
        <View style={{flex:1}}>
        <View style={{flex:1,backgroundColor:'red'}}>
         {this.state.choosenParticipant}    
        </View>           

       <View style={{flex:1, backgroundColor:'blue'}}>
       <ScrollView style={{flex:1}}>       

       <TouchableOpacity onPress={()=>{this._chooseParticipant('LocalView')}}>
       <View style={{flex:1,flexDirection:'row'}}>
       <View style={{flex:2,alignItems:'center'}}>
       <TwilioVideoLocalView
         enabled={true}
         style={{height:deviceHeight, width:deviceWidth/3}}
       /> 
       </View>
       <View style={{flex:3}}>
       <Text>You</Text>
       </View>
       </View>
       </TouchableOpacity>  

         {  
         Array.from(this.state.videoTracks, ([trackSid, trackIdentifier]) =>
         {
           return (
             <TouchableOpacity 
               onPress={()=>{
               console.log(trackIdentifier)||
               this._chooseParticipant(trackSid,trackIdentifier)
               }}
               key={trackSid}>
             <View style={{flexDirection:'row', flex:1}}>
             <View style={{flex:2,alignItems:'center'}}>
             <TwilioVideoParticipantView
               style={styles.twilioVideoParticipantView}
               key={trackSid}   
               keyExtractor={trackSid}     
               trackIdentifier={trackIdentifier}       
             />
             </View>
             <View style={{flex:3,alignItems:'center', justifyContent:'center'}}>
             <Text key={trackSid} style={{fontSize:23}}>{trackIdentifier.identity}</Text>
             </View>
             </View>
             </TouchableOpacity>                             
           )         
         })
        }

       </ScrollView>
       </View>
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
   )
  }
};

const styles = StyleSheet.create({
  meetingControlButtonView:{
    flex:1,
    flexDirection:'row',
    justifyContent:'space-around', 
    marginTop:5,   
    alignItems:'center'
  },
  twilioVideoParticipantView:{
    height:deviceHeight/8,
    width:deviceWidth/3,
    flexDirection:'column', 
    marginTop:5
  },
  meetingControlButton:{
    height:'100%',
    width:deviceWidth/11,
    borderRadius:deviceWidth/22,
    backgroundColor:'red',
    alignItems:'center',
    justifyContent:'center'
  }
});

export default App;