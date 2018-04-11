import React from 'react';
import { Layout } from 'antd';
import { connect } from 'react-redux';
import { compile } from 'path-to-regexp';
import AppLayout from '../../components/Layout';
import withRedux from '../../redux/withRedux';
import RepoIndex, { indexType } from '../../components/repo/Index';
import actions from '../../redux/actions/actions';
import fetchApi from '../../common/fetchApi';
import { api } from '../../common/endpoints';


const {
  Content,
} = Layout;

class Index extends React.PureComponent {
  static async getInitialProps({ req, query, store }) {
    const response = await fetchApi(compile(api.index)(query), { req });
    store.dispatch(actions.repo.setIndex(response));
  }

  static propTypes = {
    index: indexType.isRequired,
  }

  render() {
    return (
      <AppLayout>
        <RepoIndex index={this.props.index} />
      </AppLayout>
    );
  }
}

export default withRedux()(connect(state => ({ index: state.repo.index }), null)(Index));
