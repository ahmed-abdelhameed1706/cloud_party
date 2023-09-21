import React, { Component } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import { IconButton } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";

export default class MusicPlayer extends Component {
	static defaultProps = {
		song: {},
		is_playing: false,
		duration: 0,
		time: 0,
		title: "",
		artist: "",
		image_url: "https://placehold.co/640x640",
	};
	constructor(props) {
		super(props);
		this.state = {
			votes: this.props.votes,
			votes_required: this.props.votes_required,
		};
		this.playSong = this.playSong.bind(this);
		this.pauseSong = this.pauseSong.bind(this);
		this.checkWhenToSkipSong = this.checkWhenToSkipSong.bind(this);
	}

	componentDidMount() {
		this.interval = setInterval(this.checkWhenToSkipSong, 1000);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}
	checkWhenToSkipSong() {
		if (this.props.votes == this.props.votes_required) {
			this.skipSong();
			clearInterval(this.interval);
		}
	}

	skipSong() {
		const requestOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
		};
		fetch("/spotify/skip", requestOptions);
	}

	playSong() {
		const requestOptions = {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
		};
		fetch("/spotify/play", requestOptions);
	}

	pauseSong() {
		const requestOptions = {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
		};
		fetch("/spotify/pause", requestOptions);
	}
	render() {
		const songProgress = (this.props.time / this.props.duration) * 100;
		return (
			<Card align="center" className="auto-margin">
				<Grid container alignItems="center">
					<Grid item xs={4} align="center">
						<img src={this.props.image_url} width="100%" height="100%" />
					</Grid>
					<Grid item xs={8} align="center">
						<Typography component="h5" variant="h5">
							{this.props.title}
						</Typography>
						<Typography variant="subtitle1" color="textSecondary">
							{this.props.artist}
						</Typography>
						<div>
							<IconButton
								onClick={() => {
									this.props.is_playing ? this.pauseSong() : this.playSong();
								}}
							>
								{this.props.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
							</IconButton>
							{this.props.votes} / {this.props.votes_required}
							<IconButton onClick={() => this.skipSong()}>
								<SkipNextIcon />
							</IconButton>
						</div>
					</Grid>
				</Grid>
				<LinearProgress variant="determinate" value={songProgress} />
			</Card>
		);
	}
}
