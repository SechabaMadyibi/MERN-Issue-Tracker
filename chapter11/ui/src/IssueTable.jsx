import React from 'react';
import { Link, } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { withRouter } from 'react-router-dom';
import {
    Button, Glyphicon, Tooltip, OverlayTrigger, Table,
} from 'react-bootstrap';

//issue row comp

const IssueRow = withRouter(({ issue,
    location: { search },
    closeIssue,
    deleteIssue,
    index,
}) => {
    const selectLocation = { pathname: `/issues/${issue.id}`, search };
    //chapter 11
    const editTooltip = (
        <Tooltip id="close-tooltip" placement="top">Edit Issue</Tooltip>
    );
    //chapter11
    const closeTooltip = (
        <Tooltip id="close-tooltip" placement="top">Close Issue</Tooltip>
    );
    const deleteTooltip = (
        <Tooltip id="delete-tooltip" placement="top">Delete Issue</Tooltip>
    );

    //chapter11
    function onClose(e) {
        e.preventDefault();
        closeIssue(index);
    }

    function onDelete(e) {
        e.preventDefault();
        deleteIssue(index);
    }


    const tableRow = (
        <tr>
            <td>{issue.id}</td>
            <td>{issue.status}</td>
            <td>{issue.owner}</td>
            <td>{issue.created.toDateString()}</td>
            <td>{issue.effort}</td>
            <td>{issue.due ? issue.due.toDateString() : ' '}</td>
            <td>{issue.title}</td>
            <td>
                <LinkContainer to={`/edit/${issue.id}`}>
                    <OverlayTrigger delayShow={1000} overlay={editTooltip}>
                        <Button bsSize="xsmall">
                            <Glyphicon glyph="edit" />
                        </Button>
                    </OverlayTrigger>
                </LinkContainer>
                {' '}

                {/* chapter10 close issue */}
                <OverlayTrigger delayShow={1000} overlay={closeTooltip}>
                    <Button bsSize="xsmall" onClick={onClose}>
                        <Glyphicon glyph="remove" />
                    </Button>
                </OverlayTrigger>
                {' '}
                <OverlayTrigger delayShow={1000} overlay={deleteTooltip}>
                <Button bsSize="xsmall" onClick={onDelete}>
                        <Glyphicon glyph="trash" />
                    </Button>
                </OverlayTrigger>

            </td>
        </tr>
    );
    return (
        <LinkContainer to={selectLocation}>
            {tableRow}
        </LinkContainer>
    );
});

//issue table comp
export default function IssueTable({ issues, closeIssue, deleteIssue }) {
    const issueRows = issues.map((issue, index) => (
        <IssueRow
            key={issue.id}
            issue={issue}
            closeIssue={closeIssue}
            deleteIssue={deleteIssue}
            index={index}
        />
    ));
    return (
        <Table bordered condensed hover responsive>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Created</th>
                    <th>Effort</th>
                    <th>Due Date</th>
                    <th>Title</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {issueRows}
            </tbody>
        </Table>
    );
}

