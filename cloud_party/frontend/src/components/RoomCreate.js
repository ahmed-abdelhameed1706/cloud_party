import React, { Component } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
class RoomCreateConfig extends Component {
	static defaultProps = {
		update: false,
		votes_to_skip: 2,
		guests_can_pause: true,
		roomCode: null,
		updateCallback: () => {},
	};
	constructor(props) {
		super(props);
		this.state = {
			guests_can_pause: this.props.guests_can_pause,
			votes_to_skip: this.props.votes_to_skip,
			errorMsg: "",
			successMsg: "",
		};

		this.handleCreateRoomClicked = this.handleCreateRoomClicked.bind(this);
		this.handleGuestsCanPauseChange =
			this.handleGuestsCanPauseChange.bind(this);
		this.handleVotesToSkipChange = this.handleVotesToSkipChange.bind(this);
		this.handleUpdateRoomClicked = this.handleUpdateRoomClicked.bind(this);
		this.handleCreateButtons = this.handleCreateButtons.bind(this);
		this.handleUpdateButtons = this.handleUpdateButtons.bind(this);
	}

	handleGuestsCanPauseChange(e) {
		this.setState({
			guests_can_pause: e.target.value === "true" ? true : false,
		});
	}

	handleVotesToSkipChange(e) {
		this.setState({
			votes_to_skip: e.target.value,
		});
	}

	handleCreateRoomClicked() {
		const requestOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				votes_to_skip: this.state.votes_to_skip,
				guests_can_pause: this.state.guests_can_pause,
			}),
		};
		fetch("/party/api/create-room/", requestOptions)
			.then((respone) => respone.json())
			.then((data) => this.props.navigate("/party/room/" + data.code));
	}

	handleCreateButtons() {
		return (
			<Grid container spacing={1}>
				<Grid item xs={12} align="center">
					<Button
						color="primary"
						variant="contained"
						onClick={this.handleCreateRoomClicked}
					>
						Create a Room!
					</Button>
				</Grid>
				<Grid item xs={12} align="center">
					<Button
						color="secondary"
						variant="contained"
						to="/party"
						component={Link}
					>
						Back
					</Button>
				</Grid>
			</Grid>
		);
	}

	handleUpdateRoomClicked() {
		const requestOptions = {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				votes_to_skip: this.state.votes_to_skip,
				guests_can_pause: this.state.guests_can_pause,
				code: this.props.roomCode,
			}),
		};

		fetch("/party/api/update-room", requestOptions).then((response) => {
			if (response.ok) {
				this.setState({
					successMsg: "Room Updated Successfully",
				});
			} else {
				this.setState({
					errorMsg: "Error Occurred While Updating Room!",
				});
			}
			this.props.updateCallback();
		});
	}

	handleUpdateButtons() {
		return (
			<Grid item xs={12} align="center">
				<Button
					color="primary"
					variant="contained"
					onClick={this.handleUpdateRoomClicked}
				>
					Update Room!
				</Button>
			</Grid>
		);
	}

	render() {
		const title = this.props.update ? "Update Room" : "Create a Room";
		return (
			<Grid container spacing={1}>
				<Grid item xs={12} align="center">
					<Collapse
						in={
							this.state.errorMsg != "" ||
							this.state.successMsg != ""
						}
					>
						{this.state.successMsg != "" ? (
							<Alert
								severity="success"
								onClose={() => {
									this.setState({
										successMsg: "",
									});
								}}
							>
								{this.state.successMsg}
							</Alert>
						) : (
							<Alert
								severity="error"
								onClose={() => {
									this.setState({
										errorMsg: "",
									});
								}}
							>
								{this.state.errorMsg}
							</Alert>
						)}
					</Collapse>
				</Grid>
				<Grid item xs={12} align="center">
					<Typography Component="h4" variant="h4">
						{title}
					</Typography>
				</Grid>
				<Grid item xs={12} align="center">
					<FormControl component="fieldset">
						<FormHelperText>
							<div align="center">
								Guest Control Playback State!
							</div>
						</FormHelperText>
						<RadioGroup
							row
							defaultValue={this.state.guests_can_pause.toString()}
							onChange={this.handleGuestsCanPauseChange}
						>
							<FormControlLabel
								value="true"
								control={<Radio color="primary" />}
								label="Play/Pause"
								labelPlacement="bottom"
							></FormControlLabel>
							<FormControlLabel
								value="false"
								control={<Radio color="error" />}
								label="No Control"
								labelPlacement="bottom"
							></FormControlLabel>
						</RadioGroup>
					</FormControl>
				</Grid>

				<Grid item xs={12} align="center" style={{ marginTop: 12 }}>
					<FormControl>
						<TextField
							required={true}
							type="number"
							defaultValue={this.state.votes_to_skip}
							inputProps={{
								min: 1,
								style: {
									textAlign: "center",
								},
							}}
							onChange={this.handleVotesToSkipChange}
						/>
						<FormHelperText>
							<div align="center">
								Votes Required To Skip a Song!
							</div>
						</FormHelperText>
					</FormControl>
				</Grid>
				{this.props.update
					? this.handleUpdateButtons()
					: this.handleCreateButtons()}
			</Grid>
		);
	}
}

function RoomCreate(props) {
	const navigate = useNavigate();
	const update = props.update;
	const votes_to_skip = props.votes_to_skip;
	const guests_can_pause = props.guests_can_pause;
	const roomCode = props.roomCode;
	const updateCallback = props.updateCallback;

	return (
		<RoomCreateConfig
			navigate={navigate}
			update={update}
			votes_to_skip={votes_to_skip}
			guests_can_pause={guests_can_pause}
			roomCode={roomCode}
			updateCallback={updateCallback}
		/>
	);
}

export default RoomCreate;
