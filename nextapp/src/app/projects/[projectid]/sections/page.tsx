// projects/[projectid]/page.tsx
"use client"
import { fetchData } from './api';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, ExpandMore, Close } from '@mui/icons-material';
import { InputAdornment, TextField, TableContainer, TableBody, Table, TableHead, TableRow, TableCell } from '@mui/material';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { getToken } from '../../../components/cookie';
import Image from 'next/image';
//images from public folder
import phoneImage from "../../../../../public/images/phoneImage.svg";
import capture360Image from "../../../../../public/images/capture360Image.svg";
import videoWalk from "../../../../../public/images/videoWalk.svg";
import droneImage from "../../../../../public/images/droneImage.svg";


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

// Functional component for ViewsPage
const ViewsPage: React.FC = () => {

  const router = useRouter();
  const params = useParams();
  // const path = usePathname();
  const projectId = Array.isArray(params.projectid) ? params.projectid[0] : params.projectid;

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
  const [searchText, setSearchText] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [detailViewData, setDetailViewData] = useState<View | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchDataAndSetView = async () => {
      try {

        const token = getToken();
        console.log(projectId);
        const result = await fetchData(token, projectId);

        // Extract relevant data and set the state
        const mainViewData = result;
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

        // Save the in state for future use
        setDetailViewData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      finally {
        // Set loading to false when data is fetched (whether successful or not)
        setIsLoading(false);
      }
    };

    fetchDataAndSetView();
  }, []);



  // Toggle visibility of child views when clicking on view name
  const handleToggleChildren = (id: string) => {
    setExpandedViews((prevExpandedViews) => {
      // Check if the view is currently expanded
      const isExpanded = prevExpandedViews.includes(id);
      // If expanded, collapse it; otherwise, expand it
      return isExpanded
        ? prevExpandedViews.filter((viewId) => viewId !== id)
        : [...prevExpandedViews, id];
    });
  };




  // Handle click on the search icon
  const handleSearchIconClick = () => {
    setIsSearchOpen(true);
    // Expand all children by default
    setExpandedViews(view.children.map((child) => child._id));
  };


  // Handle click on the close icon in search
  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchText('');
  };


  // Handle search input change
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchText = event.target.value.toLowerCase();
    setSearchText(searchText);
  };


  // Render visible views based on search
  const renderVisibleViews = (views: View[]) => {
    const filterViewsRecursive = (view: View, depth: number = 0): View | null => {
      const viewNameLowerCase = view.name.toLowerCase();
      const matchingChildren = view.children
        .map((child) => filterViewsRecursive(child))
        .filter((child) => child !== null) as View[];

      if (viewNameLowerCase.includes(searchText) || matchingChildren.length > 0) {
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

    if (matchingViews.length === 0 && searchText.trim() !== "") {
      return (
        <div className="text-center mt-6">
          <h2>No results found</h2>
        </div>
      );
    }

    return matchingViews.map((matchedParent) => (
      <React.Fragment key={matchedParent!._id}>
        {renderViewRow(matchedParent!)}
        {expandedViews.includes(matchedParent!._id) && matchedParent!.children.length > 0 && (
          renderViewRowsRecursive(matchedParent!.children)
        )}
      </React.Fragment>
    ));
  };

  // color&name  for button
  const getStatusButtonData = (view: View): { label: string; color: string } | null => {
    if (view.designs.length === 0) {
      return {
        label: 'No Design',
        color: 'bg-orange-500',
      };
    }

    if (view.snapshots.latestSnapshot === undefined) {
      return {
        label: 'No Reality',
        color: 'bg-orange-500',
      };
    }

    if (view.snapshots.latestSnapshot.state === 'Inactive') {
      return {
        label: 'Processing',
        color: 'bg-blue-500',
      };
    }

    // Handle other cases or states as needed
    // For example, you can add more conditions for different states

    return null; // Return null if no conditions are met
  };




  // Render expanded view and its children
  const renderExpandedView = (view: View) => (
    <React.Fragment key={view._id}>
      {renderViewRow(view)}
      {view.children.length > 0 && (
        renderViewRowsRecursive(view.children)
      )}
    </React.Fragment>
  );


  const handleViewNameClick = (pid: string, id: string) => {
    const newPath = `/projects/${pid}/structure/${id}`;
    router.push(newPath);
  };


  // Render a single view row
  const renderViewRow = (view: View) => (
    <TableRow key={view._id} className={`${!view.lastUpdated ? 'bg-gray-200' : ''} border-b`}>
      <TableCell className="p-3" style={{ width: '30%' }}>
        <div className="flex items-center">
          <span
            onClick={() => handleToggleChildren(view._id)}
            className={`cursor-pointer ${view.children.length > 0 ? 'mr-2' : 'w-5'}`}
          >
            {view.children.length > 0 &&
              (expandedViews.includes(view._id) ? <ExpandMore /> : <ChevronRight />)}
          </span>
          <span
            id={view._id}
            onClick={() => handleViewNameClick(projectId, view._id)}
            className="cursor-pointer pl-7 text-center"
          >
            {view.name}
          </span>
        </div>
      </TableCell>
      <TableCell className="p-3" style={{ width: '10%' }}>
        {view.status && (
          <div className="flex items-center">
            {getStatusButtonData(view) && (
              <button className={`max-h-15 mr-3 ml-2 px-1 py-1 text-white rounded text-xs ${getStatusButtonData(view)!.color}`}>
                {getStatusButtonData(view)!.label}
              </button>
            )}
          </div>
        )}
      </TableCell>
      <TableCell className="p-3" style={{ width: '5%' }}>
        {view.issueCount !== 0 ? view.issueCount : '-'}
      </TableCell>
      <TableCell className="p-3" style={{ width: '5%' }}>
        {view.taskCount !== 0 ? view.taskCount : '-'}
      </TableCell>
      <TableCell className="p-3" style={{ width: '35%' }}>
        <div className="flex flex-row gap-4 captures-cell items-center">
          <div className="flex items-center" title="Phone Image" style={{ width: '25%' }}>
            <span className="mr-2 w-[2.5em]">
              <Image src={phoneImage} alt="Phone Image" width="20" height="20" />
            </span>
            <div style={{ width: '75%' }}>
              {view.capture['Phone Image'] || '-'}
            </div>
          </div>
          <div className="flex items-center" title="360 Image" style={{ width: '25%' }}>
            <span className="mr-2 w-[2.5em]">
              <Image src={capture360Image} alt="360 Image" width="20" height="20" />
            </span>
            <div style={{ width: '75%' }}>
              {view.capture['360 Image'] || '-'}
            </div>
          </div>
          <div className="flex items-center" title="Video Walk" style={{ width: '25%' }}>
            <span className="mr-2 w-[2.5em]">
              <Image src={videoWalk} alt="360 Video" width="20" height="20" />
            </span>
            <div style={{ width: '75%' }}>
              {view.capture['360 Video'] || '-'}
            </div>
          </div>
          <div className="flex items-center" title="Drone Image" style={{ width: '25%' }}>
            <span className="mr-2 w-[2.5em]">
              <Image src={droneImage} alt="Drone Image" width="20" height="20" />
            </span>
            <div style={{ width: '75%' }}>
              {view.capture['Drone Image'] || '-'}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="p-3" style={{ width: '20%' }} >{formatDate(view.lastUpdated)}</TableCell>
    </TableRow>
  );



  // Render view rows recursively for children
  const renderViewRowsRecursive = (views: View[]) => (
    views.map((child) => (
      <React.Fragment key={child._id}>
        {child.parent !== null && renderViewRow(child)}
        {expandedViews.includes(child._id) && child.children.length > 0 && (
          renderViewRowsRecursive(child.children)
        )}
      </React.Fragment>
    ))
  );



  // Format date string
  const formatDate = (dateString: string) => {
    return dateString ? new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
  };



  // Return the main component structure
  return (
    <div className="mt-10 mx-10 overflow-none">
      <header>
        <h1 className="text-m font-bold mt-15">Building Views</h1>
      </header>
      <div className="flex justify-end mb-4 overflow-none">
        {!isSearchOpen ? (
          <Search className="cursor-pointer" onClick={handleSearchIconClick} />
        ) : (
          ""
        )}
        {isSearchOpen && (
          <TextField
            id="search"
            label="Search"
            variant="outlined"
            size="small"
            onChange={handleSearch}
            value={searchText}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Close className="cursor-pointer" onClick={handleSearchClose} />
                </InputAdornment>
              ),
            }}
          />
        )}
      </div>

      <main style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' }}>
        {/* Conditionally render the table head only when not loading */}
        <TableContainer
          style={{ overflow: 'auto', borderRadius: '10px', border: 'none', maxHeight: '100%', zIndex: 1 }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="px-6 py-3 text-left" style={{ borderBottom: '2px solid orange' }}>View Name</TableCell>
                <TableCell className="px-6 py-3 text-center" style={{ borderBottom: '2px solid orange' }}>Status</TableCell>
                <TableCell className="px-6 py-3 text-center" style={{ borderBottom: '2px solid orange' }}>Issues</TableCell>
                <TableCell className="px-6 py-3 text-center" style={{ borderBottom: '2px solid orange' }}>Tasks</TableCell>
                <TableCell className="px-6 py-3 text-left" style={{ borderBottom: '2px solid orange' }}>Captures</TableCell>
                <TableCell className="px-6 py-3 text-left" style={{ borderBottom: '2px solid orange' }}>Last Processed Capture</TableCell>
              </TableRow>
            </TableHead>
            {/* Show loader while data is being fetched */}
            {isLoading && (
              <tbody>
                <tr>
                  <td colSpan={6} className="flex justify-center items-center h-full">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
            {!isLoading && ( // Conditionally render the table body when not loading
              <TableBody>
                {!!searchText ? (
                  renderVisibleViews(view.children)
                ) : (
                  <>
                    {renderViewRow(view)}
                    {expandedViews.includes(view._id) && view.children.length > 0 && (
                      renderViewRowsRecursive(view.children)
                    )}
                  </>
                )}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </main>
    </div>
  );
};

export default ViewsPage;