//HierarchyComponent.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Button, TextField, Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { getToken } from '@/app/components/cookie';
import { useParams, useRouter } from 'next/navigation';
import { InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { fetchData } from './api';
import { styled } from '@mui/system';

// Create a makeStyles instance
const HierarchyButton = styled(Button)(({ theme }) => ({
  color: 'black',
  backgroundColor: 'white',
  '&:hover': {
    backgroundColor: 'gray', // Change to the desired hover color
  },
}));

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
  const params = useParams();
  const structureId = Array.isArray(params.structure) ? params.structure[0] : params.structure;

  // Fetch data on component mount
  useEffect(() => {
    const fetchDataAndSetData = async () => {
      try {
        // Fetch data using token and project ID from URL
        const token = getToken();
        // console.log(params);
        const projectId = Array.isArray(params.projectid) ? params.projectid[0] : params.projectid;
        // console.log(projectId);
        const result = await fetchData(token, projectId);

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
    if (!searchText) {
      setExpanded(true);
    } else {
      // If there is a search term, expand views
      setExpandedViews([(data?._id || ''), ...(data?.children.map((child) => child._id) || [])]);
    }
  };

  //text and color of status
  const getStatusButtonData = (view: View): { label: string; color: string } | null => {
    if (view.designs.length === 0) {
      return {
        label: 'ND',
        color: 'bg-orange-500',
      };
    }

    if (view.snapshots.latestSnapshot === undefined) {
      return {
        label: 'NR',
        color: 'bg-orange-500',
      };
    }

    if (view.snapshots.latestSnapshot.state === 'Inactive') {
      return {
        label: 'P',
        color: 'bg-blue-500',
      };
    }

    return null; // Return null if no conditions are met
  };

  //displaying the relevant data after search
  const renderVisibleViews = (views: View[]) => {
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
    //matching list
    const matchingViews = views.map((view) => filterViewsRecursive(view)).filter(Boolean);
    //if no results
    if (matchingViews.length === 0 && searchTerm.trim() !== "") {
      return (
        <div className="text-center mt-6">
          <h2>No results found</h2>
        </div>
      );
    }
    //display the results of search
    return matchingViews.map((matchedParent) => (
      <React.Fragment key={matchedParent!._id}>
        {renderViewRow(matchedParent!, 1)}
        {expandedViews.includes(matchedParent!._id) && matchedParent!.children.length > 0 && (
          renderViewRowsRecursive(matchedParent!.children, 1)
        )}
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
    //write function to handke click
  };

  // Render a single view row
  const renderViewRow = (view: View, depth: number = 0) => {
    const isCurrentStructure = view._id === structureId;
    const hasLastUpdated = !!view.lastUpdated;
    return (
      <TableRow key={view._id} className={`${!hasLastUpdated ? 'bg-gray-200' : ''} border-b ${isCurrentStructure ? 'bg-orange-100' : 'hover:bg-gray-100'}`} style={{ color: isCurrentStructure ? '#F1742E' : '' }}>
        <TableCell className={`p-3 pl-3 mb-5 border ${isCurrentStructure ? '' : ''}`} style={{ width: '330px', marginLeft: `${((depth || 0) + 1) * 15}px` }}>
          <div className="flex justify-between items-center w-full">
            <div>
              <span onClick={() => handleToggleChildren(view._id)} className="pl-3 cursor-pointer">
                {view.children && view.children.length > 0 && (expandedViews.includes(view._id) ? '-' : '+')}
              </span>
              <span
                id={view._id}
                onClick={() => handleViewNameClick(view._id)}
                className={`cursor-pointer pl-2 ${isCurrentStructure ? 'text-white' : ''}`}
                style={{ marginLeft: '5px', color: isCurrentStructure ? '#F1742E' : '' }}
              >
                {view.name}
              </span>
            </div>
            {/* Display status button */}
            {view.status && (
              <div className="flex items-center status-button-container">
                {getStatusButtonData(view) && (
                  <button className={`max-h-15 w-[2em] px-1 py-1 text-white rounded text-xs ${getStatusButtonData(view)!.color}`}>
                    {getStatusButtonData(view)!.label}
                  </button>
                )}
              </div>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };




  // Render view rows recursively for children
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

 


 //render the component 
  return (
    <div className="fixed bottom-0 left-0">
      {!expanded && (
        <HierarchyButton
        variant="contained"
        onClick={() => setExpanded(!expanded)}
        className="transform rotate-90 relative top-[-60px] no-hover"
      >
        Hierarchy {expanded ? '▼' : '►'}
      </HierarchyButton>
      )}
      {expanded && (
        <div className="hierarchy-container ml-10 mb-5 h-[700] overflow-hidden">
          <Paper elevation={3} className="pt-4 pl=4 pb-2 m mt-6 w-80 h-[500px] border">
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
              className="p-2 mb-6 text-orange-500"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <div className="hierarchy-scroll max-h-[300px] overflow-y-auto">
              {!!searchTerm ? (
                <div className="flex flex-col">
                  {renderVisibleViews([data!])}
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
