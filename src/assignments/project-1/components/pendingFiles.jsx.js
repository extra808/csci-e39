import React from 'react'
import PropTypes from 'prop-types'

// const PendingFiles = ({pendingFiles}) => {
// 	return <div className="pendingFiles">
// 		<h2>In Progress</h2>
// 		<ul>
// 			{pendingFiles.map(file => {
// 				const {id, name, progress} = file

// 				return <li key={id}>
// 					<progress value={progress} max="100">{progress}%</progress>
// 					<span className="pending-filename">{name}</span>
// 				</li>
// 			})}
// 		</ul>
// 	</div>
// }

class PendingFiles extends React.Component {

	constructor() {
		super(...arguments);
		this.state = {hidden: true};
	}

	reveal() {
		const {pendingFiles} = this.props;
		const checkLength = pendingFiles.length;
		if(checkLength === 0) {
			if (this.state.hidden === false) {
				this.setState({hidden: true});
			}
			return 'sr-only hide'
		}
		else {
			if (this.state.hidden === true) {
				this.setState({hidden: false});
			}
			return null
		}
	}

	render() {
		return <div className={['pendingFiles', this.reveal()].join(' ')} aria-hidden={this.state.hidden}>
		<h2>In Progress</h2>
		<ul>
			{this.props.pendingFiles.map(file => {
				const {id, name, progress} = file

				return <li key={id}>
					<progress value={progress} max="100">{progress}%</progress>
					<span className="pending-filename">{name}</span>
				</li>
			})}
		</ul>
	</div>
	}
}

PendingFiles.propTypes = {
	pendingFiles: PropTypes.object.isRequired,
}

export default PendingFiles
