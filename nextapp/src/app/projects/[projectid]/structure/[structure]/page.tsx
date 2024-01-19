// components/HierarchyComponent.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Button, TextField, Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { getToken } from '@/app/components/cookie';
import { useRouter } from 'next/navigation';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { fetchData } from './api';

// Interfaces for data structures
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
  isChild?: boolean;
  depth?: number | null | undefined;
}

const HierarchyComponent: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<View | null>(null);
  const [expandedViews, setExpandedViews] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [detailViewData, setDetailViewData] = useState<View | null>(null);
  const router = useRouter();

  // Fetch data on component mount
  useEffect(() => {
    const fetchDataAndSetData = async () => {
      try {
        // Fetch data using token and project ID from URL
        const token = getToken();
        const projectid = window.location.pathname.split('/')[2] || 'default';
        const result = await fetchData(token, projectid);

        // Extract relevant data and set the state
        const mainViewData = result;
        const viewsData = mainViewData.children;

        setData({
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

        // Save the data in state for future use
        setDetailViewData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDataAndSetData();
  }, []);

  // Toggle visibility of child views when clicking on view name
  const handleToggleChildren = (id: string) => {
    setExpandedViews((prevExpandedViews) => {
      const isExpanded = prevExpandedViews.includes(id);
      return isExpanded
        ? prevExpandedViews.filter((viewId) => viewId !== id)
        : [...prevExpandedViews, id];
    });
  };

  // Handle click on the search icon
  const handleSearchIconClick = () => {
    setIsSearchOpen(true);
    setExpandedViews(data?.children.map((child) => child._id) || []);
  };

  // Handle click on the close icon in search
  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  // Handle search input change
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const searchText = event.target.value.toLowerCase();
    setSearchTerm(searchText);
  };

  // Render visible views based on search
  const renderVisibleViews = (views: View[]) => {
    const renderView = (view: View) => (
      <React.Fragment key={view._id}>
        <TableRow>
          <TableCell className={`p-3 pl-3 border ${view.isChild ? 'pl-child' : ''}`} style={{ width: '330px' }}>
            <span onClick={() => handleToggleChildren(view._id)} className="pl-3 cursor-pointer">
              {view.children.length > 0 && (expandedViews.includes(view._id) ? '-' : '+')}
            </span>
            <span
              id={view._id}
              onClick={() => handleViewNameClick(view._id)}
              className="cursor-pointer pl-2"
              style={{ marginLeft: '5px' }}
            >
              {view.name}
            </span>
          </TableCell>
        </TableRow>
        {expandedViews.includes(view._id) && view.children.length > 0 && (
          <div style={{ paddingLeft: `${(view.depth || 0) + 1 * 20}px` }}>
            {view.children.map((child) => renderView(child))}
          </div>
        )}
      </React.Fragment>
    );

    const filterViewsRecursive = (view: View, depth: number = 0): View | null => {
      const viewNameLowerCase = view.name.toLowerCase();
      const matchingChildren = view.children
        .map((child) => filterViewsRecursive(child, depth + 1))
        .filter((child) => child !== null) as View[];

      if (viewNameLowerCase.includes(searchTerm) || matchingChildren.length > 0) {
        return {
          ...view,
          children: matchingChildren,
          isChild: matchingChildren.length > 0,
          depth,
        };
      }

      return null;
    };


    const matchingViews = views.map((view) => filterViewsRecursive(view)).filter(Boolean);

    if (matchingViews.length === 0 && searchTerm.trim() !== "") {
      return (
        <div className="text-center mt-6">
          <h2>No results found</h2>
        </div>
      );
    }

    return matchingViews.map((matchedParent) => (
      <React.Fragment key={matchedParent!._id}>
        {renderView(matchedParent!)}
      </React.Fragment>
    ));
  };

  // Render expanded view and its children
  const renderExpandedView = (view: View) => (
    <React.Fragment key={view._id}>
      {renderViewRow(view)}
      {view.children.length > 0 && renderViewRowsRecursive(view.children)}
    </React.Fragment>
  );

  const handleViewNameClick = (id: string) => {
    const pid = window.location.pathname.split('/').pop() || 'default';
    const newPath = `/projects/${pid}/structure/${id}`;
    router.push(newPath);
  };

  // Render a single view row
  const renderViewRow = (view: View, depth: number = 0) => (
    <TableRow key={view._id} className="">
      <TableCell className="p-3 pl-3 mb-5 border bg-gray-200" style={{ width: '330px', paddingLeft: `${(depth || 0) * 5}px` }}>
        <span onClick={() => handleToggleChildren(view._id)} className="pl-3 cursor-pointer">
          {view.children && view.children.length > 0 &&
            (expandedViews.includes(view._id) ? '-' : '+')}
        </span>
        <span
          id={view._id}
          onClick={() => handleViewNameClick(view._id)}
          className="cursor-pointer pl-2"
          style={{ marginLeft: '5px' }}
        >
          {view.name}
        </span>
        {/* Display status button */}
        {view.designs.length > 0 && (
          <button
            className={`ml-2 ${view.status === 'In Progress' ? 'bg-blue-500' : 'bg-orange-500'
              } text-white px-1 py-1 rounded text-xs`}
          >
            {view.status === 'In Progress' ? 'P' : 'ND'}
          </button>

        )}
      </TableCell>
    </TableRow>
  );


  const renderViewRowsRecursive = (views: View[] | null, depth: number = 0) => (
    views?.map((child) => (
      <React.Fragment key={child._id}>
        {child.parent !== null && renderViewRow(child, depth)}
        {expandedViews.includes(child._id) && child.children && child.children.length > 0 && (
          <div style={{ marginLeft: `${((depth || 0) + 1) * 30}px` }}>
            {renderViewRowsRecursive(child.children, depth + 1)}
          </div>
        )}
      </React.Fragment>
    ))
  );
  return (
    <div className="fixed bottom-0 left-0">
      {!expanded && (
        <Button
          variant="contained"
          // color="default"  // Change to 'default' for grey color
          onClick={() => setExpanded(!expanded)}
          className="transform rotate-90 relative top-[-60px] no-hover"  // 'no-hover' class to remove hover effect
        >
          Hierarchy {expanded ? '▼' : '►'}
        </Button>
      )}
      {expanded && (
        <div className="hierarchy-container ml-10 mb-5 h-[700] overflow-hidden">
          <Paper elevation={3} className="pt-4 pl=4 pb-4 m mt-6 w-80 h-[500px] border">
            <div className="flex justify-between items-center mb-2">
              <Typography variant="h6" className="pl-4">Project Hierarchy</Typography>
              <Button color="secondary" onClick={() => setExpanded(!expanded)}>
                ✖
              </Button>
            </div>
            <TextField
              variant="outlined"
              placeholder="Search..."
              fullWidth
              value={searchTerm}
              onChange={(e) => handleSearch(e)}
              className="p-4 mb-6 text-orange-500"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <div className="hierarchy-scroll max-h-[330px] overflow-y-auto">
              {!!searchTerm ? (
                <div className="flex flex-col">
                  {renderVisibleViews(data?.children || [])}
                </div>
              ) : (
                <div className="flex flex-col">
                  {renderViewRow(data!)}
                  {expandedViews.includes(data!._id) && data!.children.length > 0 && (
                    <div className="pl-5 border">
                      {renderViewRowsRecursive(data!.children)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Paper>
        </div>
      )}
    </div>
  );
};

export default HierarchyComponent;