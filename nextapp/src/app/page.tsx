import Head from 'next/head';
import NavComponent from './components/navbar';

const LandingPage: React.FC = () => {
  return (
    <div>
      <Head>
        <title>Landing Page</title>
      </Head>

      <NavComponent />
      <div className="container mx-auto mt-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to ConstructN</h1>
        <h2 className="text-2xl mb-8">Your Source for Efficient Construction Management</h2>
        <p className="my-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibus odio nec ullamcorper
          fermentum. Vivamus varius elit nec sem tristique dignissim.
        </p>
        <p className="my-4">
          Phasellus eget efficitur justo. Integer vulputate, ligula vel rhoncus dapibus, velit
          odio posuere sapien, vel luctus arcu mi eu dolor.
        </p>

      </div>
    </div>
  );
};

export default LandingPage;
