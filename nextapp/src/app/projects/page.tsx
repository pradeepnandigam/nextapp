// pages/views/[projectid].tsx
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import TableBody from '@mui/material/TableBody';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { getToken } from '../components/cookie';

// Interfaces for better type checking
interface Capture {
  [key: string]: number;
}

interface Snapshot {
  captureDateTime: string;
  state: string;
}

interface Design {
  isUploaded: boolean;
  status: string;
  _id: string;
  type: string;
  name: string;
  project: string;
  structure: string;
  storage: Array<{
    provider: string;
    path: string;
    providerType: string;
    format: string;
  }>;
  tm: {
    tm: number[];
    offset: number[];
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface View {
  _id: string;
  name: string;
  type: string;
  isExterior: boolean;
  project: string;
  parent: string | null;
  children: View[];
  designs: Design[];
  status: string;
  lastUpdated: string;
  taskCount: number;
  issueCount: number;
  capture: Capture;
  snapshots: {
    snapshotActiveCount: number;
    snapshotInActiveCount: number;
    snapshotReviewCount: number;
    latestSnapshot: Snapshot;
  };
  isExpanded?: boolean;
}

interface ViewsPageProps {
  projectid: string;
}

const ViewsPage: React.FC<ViewsPageProps> = ({ projectid }) => {
  // State variables
  const [view, setView] = useState<View>({
    _id: '',
    name: '',
    type: '',
    isExterior: false,
    project: '',
    parent: null,
    children: [],
    designs: [],
    status: '',
    lastUpdated: '',
    taskCount: 0,
    issueCount: 0,
    capture: {},
    snapshots: {
      snapshotActiveCount: 0,
      snapshotInActiveCount: 0,
      snapshotReviewCount: 0,
      latestSnapshot: {
        captureDateTime: '',
        state: '',
      },
    },
  });
  const [expandedViews, setExpandedViews] = useState<string[]>([]);
  const token = getToken();

  // Fetch data from the API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.dev2.constructn.ai/api/v1/views/web/PRJ201897/sectionList`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const mainViewData = response.data.result;
        const viewsData = mainViewData.children;

        setView({
          _id: mainViewData._id,
          name: mainViewData.name,
          type: mainViewData.type,
          isExterior: mainViewData.isExterior,
          project: mainViewData.project,
          parent: mainViewData.parent,
          children: viewsData,
          designs: mainViewData.designs,
          status: mainViewData.status,
          lastUpdated: mainViewData.lastUpdated,
          taskCount: mainViewData.taskCount,
          issueCount: mainViewData.issueCount,
          capture: mainViewData.capture,
          snapshots: mainViewData.snapshots,
        });
      } catch (error) {
        console.error('Error fetching data:', Error);
      }
    };

    fetchData();
  }, [projectid, token]);

  // Toggle children views on click
  const handleToggleChildren = (id: string) => {
    setExpandedViews((prevExpandedViews) =>
      prevExpandedViews.includes(id)
        ? prevExpandedViews.filter((viewId) => viewId !== id)
        : [...prevExpandedViews, id]
    );
  };

  // Format date string to a readable format
  const formatDate = (dateString: string) => {
    return dateString ? new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
  };

  // Render a single row for a view
  const renderViewRow = (view: View, isChild: boolean = false) => (
    <TableRow key={view._id} className={`${isChild ? 'pl-8' : ''} ${!view.lastUpdated ? 'bg-gray-200' : ''}`}>
      <TableCell className="flex items-center p-3">
        <span onClick={() => handleToggleChildren(view._id)} className="cursor-pointer">
          {view.children.length > 0 &&
            (expandedViews.includes(view._id) ? <ExpandMoreIcon /> : <ChevronRightIcon />)}
          {view.name}
        </span>
      </TableCell>
      <TableCell className="p-3">{view.issueCount}</TableCell>
      <TableCell className="p-3">{view.taskCount}</TableCell>
      <TableCell className="p-3">
        <div className="flex flex-row">
          <div>
            <span className="mr-2">🚁</span> {view.capture['Phone Image'] || '-'}
          </div>
          <div className='ml-3'>
            <span className="mr-2">🌐</span> {view.capture['360 Image'] || '-'}
          </div>
          <div className='ml-3'>
            <span className="mr-2">🎥</span> {view.capture['360 Video'] || '-'}
          </div>
          <div className='ml-3'>
            <span className="mr-2">🚁</span> {view.capture['Drone Image'] || '-'}
          </div>
        </div>
      </TableCell>
      <TableCell className="p-3">{formatDate(view.lastUpdated)}</TableCell>
    </TableRow>
  );

  // Render child views recursively
  const renderViewRowsRecursive = (views: View[]) => (
    views.map((child) => (
      <React.Fragment key={child._id}>
        {renderViewRow(child, true)}
        {expandedViews.includes(child._id) && child.children.length > 0 && (
          renderViewRowsRecursive(child.children)
        )}
      </React.Fragment>
    ))
  );

  // Component rendering
  return (
    <div className="mt-8 mx-4 overflow-auto">
      <header>
        <h1 className="text-2xl font-bold">Building Views</h1>
      </header>

      <main>
        {view && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="px-6 py-3 text-left" style={{ borderBottom: '2px solid orange' }}>View Name</TableCell>
                  <TableCell className="px-6 py-3 text-left" style={{ borderBottom: '2px solid orange' }}>Issues</TableCell>
                  <TableCell className="px-6 py-3 text-left" style={{ borderBottom: '2px solid orange' }}>Tasks</TableCell>
                  <TableCell className="px-6 py-3 text-left" style={{ borderBottom: '2px solid orange' }}>Captures</TableCell>
                  <TableCell className="px-6 py-3 text-left" style={{ borderBottom: '2px solid orange' }}>Last Processed Capture</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderViewRow(view)}
                {expandedViews.includes(view._id) && view.children.length > 0 && (
                  renderViewRowsRecursive(view.children)
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </main>
    </div>
  );
};

export default ViewsPage;
