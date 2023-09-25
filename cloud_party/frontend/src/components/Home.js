import React, { Component } from "react";
import RoomCreate from "./RoomCreate";
import RoomJoin from "./RoomJoin";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
} from "react-router-dom";
import Room from "./Room";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ButtonGroup from "@mui/material/ButtonGroup";

export default class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			roomCode: null,
		};
		this.clearRoomCode = this.clearRoomCode.bind(this);
	}

	async componentDidMount() {
		fetch("/party/api/user-in-room")
			.then((response) => response.json())
			.then((data) => {
				this.setState({
					roomCode: data.code,
				});
			});
	}

	clearRoomCode() {
		this.setState({
			roomCode: null,
		});
	}

	renderHomePage() {
		if (this.state.roomCode) {
			return (
				<Navigate
					to={"/party/room/" + this.state.roomCode}
					replace={true}
				/>
			);
		} else {
			return (
				<Grid container spacing={3}>
					<Grid item xs={12} align="center">
						<Typography variant="h3" component="h3">
							Cloud Party!
						</Typography>
					</Grid>
					<Grid item xs={12} align="center">
						<ButtonGroup disableElevation variant="contained">
							<Button
								color="primary"
								component={Link}
								to="/party/join-room"
							>
								Join a Room
							</Button>
							<Button
								color="secondary"
								component={Link}
								to="/party/create-room"
							>
								Create a Room
							</Button>
						</ButtonGroup>
					</Grid>
				</Grid>
			);
		}
	}

	render() {
		return (
			<Router>
				<Routes>
					<Route
						exact
						path="/party"
						element={this.renderHomePage()}
					/>
					<Route
						exact
						path="party/create-room"
						element={<RoomCreate />}
					/>
					<Route
						exact
						path="party/join-room"
						element={<RoomJoin />}
					/>
					<Route
						path="party/room/:roomCode"
						element={
							<Room clearCodeCallback={this.clearRoomCode} />
						}
					/>
				</Routes>
			</Router>
		);
	}
}
