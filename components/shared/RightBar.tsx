import React from "react";

const RightBar = () => {
  return (
    <section className="custom-scollbar rightsidebar">
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">
          Suggested Communities
        </h3>
      </div>
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">Suggested User</h3>
      </div>
    </section>
  );
};

export default RightBar;