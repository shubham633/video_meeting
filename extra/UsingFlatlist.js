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
  TouchableWithoutFeedback,
  FlatList
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
        style={{flex:8}}
      />
    ),
    participants: new Map(),
    videoTracks: new Map(),
    token:'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzhmYTc2YTk4MWMzNzU5NjYyOWZmMTk5Mjk4NGNlZmNiLTE2MDYyMjEwODAiLCJpc3MiOiJTSzhmYTc2YTk4MWMzNzU5NjYyOWZmMTk5Mjk4NGNlZmNiIiwic3ViIjoiQUM0OWY0NTc1ZmQ5ZjBjNTNkYmJjYTE2YzdjZmVhNzU2YyIsImV4cCI6MTYwNjIyNDY4MCwiZ3JhbnRzIjp7ImlkZW50aXR5Ijoic2h1YmhhbTMiLCJ2aWRlbyI6eyJyb29tIjoicm9vbTI0XzAzIn19fQ.HQMDyaHbct97ROhXmpR8r4Xx3Gnu94nsxAq9ew0pv5E'
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
          { participantSid: participant.sid, 
            videoTrackSid: track.trackSid,
            identity:participant.identity }
        ]
      ])
    });
  };

  _chooseParticipant = (trackSid_Or_localView, trackIdentifier)=>{
    console.log('trackSid'+trackSid_Or_localView)
    console.log(trackIdentifier)
    if(trackSid_Or_localView=='LocalView')
    {
    this.setState({
      choosenParticipant:
      <TwilioVideoLocalView
        enabled={true}
        style={{flex:8, overflow:'hidden', elevation:1000}}
      />
    });
    console.log('local view')
    }
    else
    {
    this.setState({
      choosenParticipant:
      <TwilioVideoParticipantView
        style={{flex:8, overflow:'hidden', elevation:1000}}
        key={trackSid_Or_localView}
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

  renderSeparator = () => {  
    return (  
        <View  
            style={{  
                height: 1,  
                width: "100%",  
                backgroundColor: "#000",  
            }}  
        />  
    );  
};  
//handling onPress action  
getListViewItem = (item) => {  
    Alert.alert(item.key);  
}  

  render() {
    return (
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
          (this.state.status === 'connected' || this.state.status === 'connecting')&&
          <View style={{flex:1, overflow:'hidden'}}>
            <View style={{flex:1, overflow:'hidden', elevation:1000, position:'relative'}}>   
            {this.state.choosenParticipant}       
              <View style={styles.meetingControlButtonView}>

              <View style={styles.meetingControlButton}>
              <TouchableWithoutFeedback onPress={this._onMuteButtonPress}>
              <Octicons
                name={ this.state.isAudioEnabled ? "unmute" : "mute" }
                color="white"
                size={25}
              />    
              </TouchableWithoutFeedback>   
              </View>    

              <View style={styles.meetingControlButton}>
              <TouchableWithoutFeedback  onPress={this._onEndButtonPress}>
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
                name={ this.state.isVideoEnabled ? "videocam" : "videocam-off" }
                color="white"
                size={25}                         
                />
              </TouchableWithoutFeedback>   
              </View>
             

              <View style={styles.meetingControlButton}>
              <TouchableWithoutFeedback  onPress={this._onFlipButtonPress}>
              <MaterialIcons
                name="flip-camera-android"
                color="white"            
                size={25}
                />
              </TouchableWithoutFeedback>   
              </View> 
              </View>
            </View>      
  
            <View style={{flex:1, position:'relative'}}>
            {
              <View>
              <FlatList  
              data = {
                Array.from(this.state.videoTracks, ([trackSid, trackIdentifier]) =>
                {
                  return (
                    <View>
                    <TouchableOpacity onPress={()=>{this._chooseParticipant('LocalView')}}>
                    <View style={{flex:1,flexDirection:'row'}}>
                    <View style={{flex:2,alignItems:'center'}}>
                    <TwilioVideoLocalView
                      enabled={true}
                      style={{height:deviceHeight, width:deviceWidth/3}}
                    /> 
                    </View>
                    <View style={{flex:3,
                      alignItems:'center',
                      justifyContent:'center'}}>
                    <Text style={{fontSize:23}}>You</Text>
                    </View>
                    </View>
                    </TouchableOpacity>
      
                    <TouchableOpacity 
                      onPress={()=>{
                      console.log(trackIdentifier)||
                      this._chooseParticipant(trackSid,trackIdentifier)
                      }}
                      key={trackSid}>
                    <View style={{flexDirection:'row', flex:1, marginTop:400}}>
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
                    </View>                         
                  )         
                })
              }   
                  renderItem={({item}) =>                   
                  <View>
                  {item}
                  </View>
                  }  
                    
            />     
            </View> 
            }       
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
    );
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
    height:deviceHeight,
    width:deviceWidth/3,
    flexDirection:'column', 
    marginTop:5,
    elevation:1
  },
  meetingControlButton:{
    height:'100%',
    width:deviceWidth/11,
    borderRadius:deviceWidth/22,
    backgroundColor:'red',
    alignItems:'center',
    justifyContent:'center'
  },
  item: {  
    padding: 10,  
    fontSize: 18,  
    height: 44,  
},  
});

export default App;