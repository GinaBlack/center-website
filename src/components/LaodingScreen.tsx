const LoadingScreen = () => {
  return (
    <div className="loader-wrapper">
      <div className="spinner">
        <div className="spinner-black" />
        <div className="spinner-red-place">
        <div className="spinner-red" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
