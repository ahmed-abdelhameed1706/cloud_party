import React, { Component } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import RoomCreate from "./RoomCreate";
import MusicPlayer from "./MusicPlayer";

class RoomConfig extends Component {
	constructor(props) {
		super(props);
		this.state = {
			votes_to_skip: 2,
			guests_can_pause: false,
			isHost: false,
			showSettings: false,
			spotifyAuthenticated: false,
			song: {},
		};
		this.roomCode = this.props.roomCode;

		this.leaveRoomButton = this.leaveRoomButton.bind(this);
		this.updateShowSettings = this.updateShowSettings.bind(this);
		this.renderSettingsButton = this.renderSettingsButton.bind(this);
		this.renderSettingsPage = this.renderSettingsPage.bind(this);
		this.getRoomDetails = this.getRoomDetails.bind(this);
		this.authenticateSpotify = this.authenticateSpotify.bind(this);
		this.getCurrentSong = this.getCurrentSong.bind(this);
		this.getRoomDetails();
	}

	componentDidMount() {
		this.getCurrentSong();
		this.interval = setInterval(this.getCurrentSong, 1000);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	updateShowSettings(value) {
		this.setState({
			showSettings: value,
		});
	}

	authenticateSpotify() {
		fetch("/spotify/is-authenticated")
			.then((respone) => respone.json())
			.then((data) => {
				this.setState({
					spotifyAuthenticated: data.status,
				});
				if (!data.status) {
					fetch("/spotify/get-auth-url")
						.then((respose) => respose.json())
						.then((data) => {
							window.location.replace(data.url);
						});
				}
			});
	}

	getCurrentSong() {
		fetch("/spotify/current-song")
			.then((respone) => {
				if (!respone.ok) {
					return {};
				} else {
					return respone.json();
				}
			})
			.then((data) => {
				this.setState({
					song: data,
				});
				console.log(data);
			});
	}

	renderSettingsButton() {
		return (
			<Grid item xs={12} align="center">
				<Button onClick={() => this.updateShowSettings(true)} variant="contained" color="primary">
					Settings
				</Button>
			</Grid>
		);
	}

	renderSettingsPage() {
		return (
			<Grid container spacing={1}>
				<Grid item xs={12} align="center">
					<RoomCreate
						update={true}
						votes_to_skip={this.state.votes_to_skip}
						guests_can_pause={this.state.guests_can_pause}
						roomCode={this.roomCode}
						updateCallback={this.getRoomDetails}
					/>
				</Grid>
				<Grid item xs={12} align="center">
					<Button color="secondary" variant="contained" onClick={() => this.updateShowSettings(false)}>
						Close
					</Button>
				</Grid>
			</Grid>
		);
	}

	getRoomDetails() {
		fetch("/api/get-room" + "?code=" + this.roomCode)
			.then((respone) => {
				if (!respone.ok) {
					this.props.clearCodeCallback();
					this.props.navigate("/");
				}

				return respone.json();
			})
			.then((data) => {
				this.setState({
					votes_to_skip: data.votes_to_skip,
					guests_can_pause: data.guests_can_pause,
					isHost: data.isHost,
				});
				if (this.state.isHost) {
					this.authenticateSpotify();
				}
			});
	}

	leaveRoomButton() {
		const requestOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
		};
		fetch("/api/leave-room", requestOptions).then((_response) => {
			this.props.clearCodeCallback();
			this.props.navigate("/");
		});
	}

	render() {
		if (this.state.showSettings) {
			return this.renderSettingsPage();
		}
		return (
			<Grid container spacing={1}>
				<Grid item xs={12} align="center">
					<Typography component="h4" variant="h4">
						Code: {this.roomCode}
					</Typography>
				</Grid>
				<MusicPlayer {...this.state.song} />
				{this.state.isHost == true ? this.renderSettingsButton() : null}
				<Grid item xs={12} align="center">
					<Button color="secondary" variant="contained" onClick={this.leaveRoomButton}>
						Leave Room
					</Button>
				</Grid>
			</Grid>
		);
	}
}

function Room(props) {
	const { roomCode } = useParams();
	const clearCodeCallback = props.clearCodeCallback;

	const navigate = useNavigate();
	return <RoomConfig roomCode={roomCode} clearCodeCallback={clearCodeCallback} navigate={navigate} />;
}

export default Room;
