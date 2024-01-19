// projects/[projectid]/page.tsx
"use client"
import { fetchData } from './api';
import React, { useState, useEffect } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import TableBody from '@mui/material/TableBody';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import CloseIcon from '@mui/icons-material/Close';
import { getToken } from '../../components/cookie';
import Image from 'next/image';
import phoneImage from "../../../../public/images/phoneImage.svg";
import capture360Image from "../../../../public/images/capture360Image.svg";
import videoWalk from "../../../../public/images/videoWalk.svg";
import droneImage from "../../../../public/images/droneImage.svg";
import { useRouter } from 'next/navigation';

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
}

// Functional component for ViewsPage
const ViewsPage: React.FC = () => {
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
  const router=useRouter();

  // Fetch data on component mount
  useEffect(() => {
    const fetchDataAndSetView = async () => {
      try {
        // Fetch data using token and project ID from URL
        const token = getToken();
        const projectid = window.location.pathname.split('/').pop() || 'default';
        const result = await fetchData(token, projectid);

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
    };

    fetchDataAndSetView();
  }, []);



  // Toggle visibility of child views when clicking on view name
  const handleToggleChildren = (id: string) => {
    // Log view._id when the view name is clicked
    console.log(view._id);

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
    const filterViewsRecursive = (view: View): View[] => {
      const viewNameLowerCase = view.name.toLowerCase(); // Convert view name to lowercase
      const matchingChildren = view.children.flatMap((child) => filterViewsRecursive(child));
      const matchingView = { ...view, children: matchingChildren };

      // Filter views based on search text
      return viewNameLowerCase.includes(searchText) || matchingChildren.length > 0 ? [matchingView] : [];
    };

    const matchingViews = views.flatMap((view) => filterViewsRecursive(view));
    if (matchingViews.length === 0 && searchText.trim() !== "") {
      // No results found
      return (
        <div className="text-center mt-6">
          <h2>No results found</h2>
        </div>
      );
    }
    return matchingViews.map((child) => (
      <React.Fragment key={child._id}>
        {renderExpandedView(child)}
      </React.Fragment>
    ));
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


  const handleViewNameClick = (id: string) => {
  const pid = window.location.pathname.split('/').pop() || 'default';
  const newPath = `/projects/${pid}/structure/${id}`; // Append the new segment
  // Push to the new URL
  router.push(newPath);
  };


  // Render a single view row
  const renderViewRow = (view: View) => (
    <TableRow key={view._id} className={`${!view.lastUpdated ? 'bg-gray-200' : ''} border-b`}>
      <TableCell className="p-3">
        <span onClick={() => handleToggleChildren(view._id)} className="cursor-pointer">
          {view.children.length > 0 &&
            (expandedViews.includes(view._id) ? <ExpandMoreIcon /> : <ChevronRightIcon />)}
        </span>
        <span
          id={view._id} // Set the id attribute with the child _id
          onClick={() => handleViewNameClick(view._id)}
          className="cursor-pointer"
          style={{ marginLeft: '5px' }} // Add some spacing if needed
        >
          {view.name}
        </span>
      </TableCell>
      <TableCell className="p-3">
        {view.status && (
          <div className="flex items-center">
            <button className="max-h-15 mr-3 ml-2 px-1 py-1 bg-blue-500 text-white rounded text-xs">
              {view.status === 'In Progress' ? 'Processing' : view.status}
            </button>
          </div>
        )}
      </TableCell>
      <TableCell className="p-3">{view.issueCount}</TableCell>
      <TableCell className="p-3">{view.taskCount}</TableCell>
      <TableCell className="p-3">
        <div className="flex flex-row gap-5 captures-cell items-center">
          <div className="flex items-center" title="Phone Image" style={{ marginInlineEnd: '10px' }}>
            <span className="mr-2">
              <Image src={phoneImage} alt="Phone Image" width="20" height="20" />
            </span>
            {view.capture['Phone Image'] || '-'}
          </div>
          <div className="flex items-center" title="360 Image" style={{ marginInlineEnd: '10px' }}>
            <span className="mr-2">
              <Image src={capture360Image} alt="360 Image" width="20" height="20" />
            </span>
            {view.capture['360 Image'] || '-'}
          </div>
          <div className="flex items-center" title="Video Walk" style={{ marginInlineEnd: '10px' }}>
            <span className="mr-2">
              <Image src={videoWalk} alt="360 Video" width="20" height="20" />
            </span>
            {view.capture['360 Video'] || '-'}
          </div>
          <div className="flex items-center" title="Drone Image" style={{ marginInlineEnd: '10px' }}>
            <span className="mr-2">
              <Image src={droneImage} alt="Drone Image" width="20" height="20" />
            </span>
            {view.capture['Drone Image'] || '-'}
          </div>
        </div>
      </TableCell>
      <TableCell className="p-3">{formatDate(view.lastUpdated)}</TableCell>
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
          <SearchIcon className="cursor-pointer" onClick={handleSearchIconClick} />
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
                  <CloseIcon className="cursor-pointer" onClick={handleSearchClose} />
                </InputAdornment>
              ),
            }}
          />
        )}
      </div>

      <main style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' }}>
        {view && (
          <TableContainer
            style={{ overflow: 'auto', borderRadius: '10px', border: 'none', maxHeight: '100%', zIndex: 1 }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="px-6 py-3 text-left" style={{ borderBottom: '2px solid orange' }}>View Name</TableCell>
                  <TableCell className="px-6 py-3 text-left" style={{ borderBottom: '2px solid orange' }}>Status</TableCell>
                  <TableCell className="px-6 py-3 text-left" style={{ borderBottom: '2px solid orange' }}>Issues</TableCell>
                  <TableCell className="px-6 py-3 text-left" style={{ borderBottom: '2px solid orange' }}>Tasks</TableCell>
                  <TableCell className="px-6 py-3 text-left" style={{ borderBottom: '2px solid orange' }}>Captures</TableCell>
                  <TableCell className="px-6 py-3 text-left" style={{ borderBottom: '2px solid orange' }}>Last Processed Capture</TableCell>
                </TableRow>
              </TableHead>
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
            </Table>
          </TableContainer>
        )}
      </main>
    </div>
  );
};

// Export the component
export default ViewsPage;
