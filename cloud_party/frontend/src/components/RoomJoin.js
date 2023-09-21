import React, { Component } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

class RoomJoinConfig extends Component {
	constructor(props) {
		super(props);
		this.state = {
			roomCode: "",
			error: "",
		};
		this.getRoomCode = this.getRoomCode.bind(this);
		this.joinButtonClicked = this.joinButtonClicked.bind(this);
	}

	getRoomCode(e) {
		this.setState({
			roomCode: e.target.value,
		});
	}

	joinButtonClicked() {
		const requestOption = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				code: this.state.roomCode,
			}),
		};

		fetch("/api/join-room", requestOption)
			.then((response) => {
				if (response.ok) {
					this.props.navigate("/room/" + this.state.roomCode);
				} else {
					this.setState({
						error: "Invalid Room Code",
					});
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	render() {
		return (
			<Grid container spacing={1}>
				<Grid item xs={12} align="center">
					<Typography component="h4" variant="h4">
						Join Room
					</Typography>
				</Grid>
				<Grid item xs={12} align="center">
					<TextField
						error={this.state.error}
						label="Code"
						value={this.state.roomCode}
						variant="outlined"
						helperText={this.state.error}
						placeholder="Enter Room Code"
						onChange={this.getRoomCode}
					></TextField>
				</Grid>
				<Grid item xs={12} align="center" style={{ marginTop: 12 }}>
					<Button variant="contained" color="primary" onClick={this.joinButtonClicked}>
						Enter Room
					</Button>
				</Grid>
				<Grid item xs={12} align="center">
					<Button variant="contained" color="secondary" to="/" component={Link}>
						Back
					</Button>
				</Grid>
			</Grid>
		);
	}
}

function RoomJoin() {
	const navigate = useNavigate();
	return <RoomJoinConfig navigate={navigate} />;
}

export default RoomJoin;
