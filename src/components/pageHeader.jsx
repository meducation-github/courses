import PropTypes from "prop-types";

export default function PageHeader({ title, subtitle }) {
  return (
    <div className="max-w-screen-3xl mx-auto px-4 md:px-4 border-b border-gray-300">
      <div className="items-start justify-between py-4 md:flex">
        <div className="max-w-4xl md:flex items-baseline">
          <h3 className="text-gray-800 text-2xl font-bold">{title}</h3>
          <p className="text-gray-600 md:ml-4 text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node.isRequired,
};
